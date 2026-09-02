<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div class="login-aurora absolute inset-0" />

    <div class="login-orb login-orb-a absolute -left-24 -top-28 h-[34rem] w-[34rem] rounded-full" />
    <div class="login-orb login-orb-b absolute -right-28 top-1/4 h-[30rem] w-[30rem] rounded-full" />
    <div class="login-orb login-orb-c absolute bottom-[-8rem] left-1/4 h-[26rem] w-[26rem] rounded-full" />

    <div class="login-ring absolute left-[12%] top-[18%] hidden h-64 w-64 rounded-full lg:block" />
    <div class="login-ring login-ring-delay absolute right-[8%] bottom-[16%] hidden h-48 w-48 rounded-full lg:block" />

    <svg class="absolute inset-0 h-full w-full opacity-40 dark:opacity-25" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="login-dots" width="36" height="36" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" class="fill-indigo-400/40 dark:fill-indigo-300/30" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-dots)" />
    </svg>

    <div class="login-grid absolute inset-0" />
  </div>
</template>

<style scoped>
.login-aurora {
  background:
    radial-gradient(1200px 600px at 12% 8%, rgba(129, 140, 248, 0.45), transparent 55%),
    radial-gradient(900px 500px at 88% 18%, rgba(167, 139, 250, 0.35), transparent 50%),
    radial-gradient(800px 500px at 50% 100%, rgba(56, 189, 248, 0.22), transparent 55%);
  animation: aurora-shift 14s ease-in-out infinite;
}

.dark .login-aurora {
  background:
    radial-gradient(1200px 600px at 12% 8%, rgba(99, 102, 241, 0.38), transparent 55%),
    radial-gradient(900px 500px at 88% 18%, rgba(139, 92, 246, 0.28), transparent 50%),
    radial-gradient(800px 500px at 50% 100%, rgba(14, 165, 233, 0.16), transparent 55%);
}

.login-orb {
  filter: blur(48px);
  animation: orb-drift 12s ease-in-out infinite;
}

.login-orb-a {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.55), transparent 68%);
}

.login-orb-b {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.42), transparent 68%);
  animation-delay: -4s;
  animation-duration: 16s;
}

.login-orb-c {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.32), transparent 68%);
  animation-delay: -8s;
  animation-duration: 18s;
}

.login-ring {
  border: 1px solid rgba(129, 140, 248, 0.28);
  box-shadow:
    0 0 80px rgba(99, 102, 241, 0.18),
    inset 0 0 60px rgba(165, 180, 252, 0.12);
  animation: ring-pulse 8s ease-in-out infinite;
}

.login-ring-delay {
  animation-delay: -3s;
}

.login-grid {
  background-image:
    linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at center, black 18%, transparent 72%);
}

.dark .login-grid {
  background-image:
    linear-gradient(to right, rgba(165, 180, 252, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(165, 180, 252, 0.08) 1px, transparent 1px);
}

@keyframes aurora-shift {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
  50% {
    transform: scale(1.08) translate(2%, -1%);
    opacity: 0.85;
  }
}

@keyframes orb-drift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(36px, -24px) scale(1.12);
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-aurora,
  .login-orb,
  .login-ring {
    animation: none;
  }
}
</style>
