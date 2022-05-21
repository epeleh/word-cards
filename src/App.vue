<template>
  <router-view/>
</template>

<style lang="scss">
:focus {
  outline: none;
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-thumb {
  background-color: #646464;
  border: 3px solid #2e2e2e;
  border-radius: 9999px;
}

html {
  overflow-y: overlay;
}

body {
  margin: 0;
  background-color: #2e2e2e;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.no-card-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  width: 100%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 10px #00000075;
}
</style>
