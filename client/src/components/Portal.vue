<script setup lang="ts">
  defineOptions({
    name: 'PortalDisplay',
  });

  import { useFresherFriendStore } from '../stores/fresherFriend';
  const fresherFriend = useFresherFriendStore();
</script>

<template>
  <div>
    <h1>Posts: {{ fresherFriend.posts }}</h1>

    <button class="btn-primary" type="button" @click="fresherFriend.increment">
      Increment
    </button>
  </div>
</template>

<style scoped>
.btn-primary {
  cursor: pointer;
  background-color: #0056b3;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background-color: #004085;
}
.btn-primary:active {
  transform: scale(0.95); /* Shrinks the button slightly */
  background-color: #00376f; /* Darkens the color further */
}

</style>
