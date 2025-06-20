<template>
  <div class="movie-card">
    <img :src="movie.coverUrl" alt="Cover" />
    <h3>{{ movie.title }}</h3>
    <div class="buttons">
      <button @click="reject">✗</button>
      <button @click="like">❤️</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'


export default defineComponent({
  props: {
    movie: {
      type: Object as PropType<{ id: number; title: string; coverUrl: string }>,
      required: true
    }
  },
  emits: ['liked', 'rejected'],
  setup(props, { emit }) {
    const like = () => emit('liked', props.movie.id);
    const reject = () => emit('rejected', props.movie.id);
    return { like, reject };
  }
});
</script>