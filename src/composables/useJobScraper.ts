import { ref } from 'vue'
import { jobsApi, type Job, type ScrapeStatus } from '../api/jobs'

const scraping = ref(false)
const scrapeMessage = ref('')
const scrapeStatus = ref<ScrapeStatus | null>(null)

let scrapeTimer: ReturnType<typeof setTimeout> | null = null
let onJobAdded: ((job: Job) => void) | null = null
let onScrapeComplete: (() => void | Promise<void>) | null = null
let onScrapeError: ((message: string) => void) | null = null

function randomScrapeDelay() {
  return 400 + Math.random() * 300
}

async function loadScrapeStatus() {
  const { data } = await jobsApi.scrapeStatus()
  scrapeStatus.value = data
}

function scheduleScrapeNext() {
  if (!scraping.value) {
    return
  }

  scrapeTimer = setTimeout(async () => {
    if (!scraping.value) {
      return
    }

    try {
      const { data } = await jobsApi.scrapeNext()
      await loadScrapeStatus()

      if (data.status === 'added' && data.job) {
        onJobAdded?.(data.job)
        scrapeMessage.value = `Scraping… ${scrapeStatus.value?.imported_count ?? 0} jobs imported`
        scheduleScrapeNext()
        return
      }

      if (data.status === 'completed') {
        scrapeMessage.value = 'Scraping completed — all available jobs imported.'
      } else {
        scrapeMessage.value = 'Scraping stopped.'
      }

      scraping.value = false
      await onScrapeComplete?.()
    } catch {
      onScrapeError?.('Scraping failed. Please try again.')
      scraping.value = false
    }
  }, randomScrapeDelay())
}

export function useJobScraper() {
  function registerHandlers(handlers: {
    onJobAdded?: (job: Job) => void
    onScrapeComplete?: () => void | Promise<void>
    onScrapeError?: (message: string) => void
  }) {
    onJobAdded = handlers.onJobAdded ?? null
    onScrapeComplete = handlers.onScrapeComplete ?? null
    onScrapeError = handlers.onScrapeError ?? null
  }

  async function initScrapeSession() {
    await loadScrapeStatus()
    if (scrapeStatus.value?.is_active) {
      scraping.value = true
      scrapeMessage.value = 'Scraping in progress…'
      scheduleScrapeNext()
    }
  }

  async function startScraping() {
    try {
      const { data } = await jobsApi.scrapeStart()
      scrapeStatus.value = data
      scraping.value = true
      scrapeMessage.value = 'Scraping started…'
      scheduleScrapeNext()
    } catch {
      onScrapeError?.('Failed to start scraping.')
    }
  }

  async function stopScraping() {
    scraping.value = false
    if (scrapeTimer) {
      clearTimeout(scrapeTimer)
      scrapeTimer = null
    }

    try {
      await jobsApi.scrapeStop()
      scrapeMessage.value = ''
      await onScrapeComplete?.()
      await loadScrapeStatus()
    } catch {
      onScrapeError?.('Failed to stop scraping.')
    }
  }

  function cleanup() {
    if (scrapeTimer) {
      clearTimeout(scrapeTimer)
      scrapeTimer = null
    }
  }

  function clearHandlers() {
    onJobAdded = null
    onScrapeComplete = null
    onScrapeError = null
  }

  return {
    scraping,
    scrapeMessage,
    scrapeStatus,
    registerHandlers,
    clearHandlers,
    initScrapeSession,
    startScraping,
    stopScraping,
    cleanup,
  }
}
