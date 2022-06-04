<template>
  <router-view />
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

@font-face {
  font-family: "Times New Roman";
  src: url("@/assets/fonts/LiberationSerif-Regular.ttf") format("truetype");
}

@font-face {
  font-family: Arial;
  src: url("@/assets/fonts/LiberationSans-Regular.ttf") format("truetype");
}

* {
  font-family: "Times New Roman";
}

input {
  font-family: Arial;
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

@keyframes modal-show-animation {
  from { opacity: 0 }
  to { opacity: 1; }
}

@keyframes modal-close-animation {
  from { opacity: 1 }
  to { opacity: 0; }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 30px 5px #000;
  overflow: hidden;
  background-color: #4f4f4fcc;
  z-index: 5000;
  animation: modal-show-animation 0.2s;

  &.close-animation {
    animation: modal-close-animation 0.2s forwards;
  }
}
</style>
