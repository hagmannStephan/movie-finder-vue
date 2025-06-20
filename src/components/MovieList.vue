<template>
  <div>
    <form @submit.prevent="searchMovies">
      <input v-model="query" placeholder="Film suchen..." />
      <button type="submit">Suchen</button>
    </form>

    <div v-if="movies.length">
      <MovieCard
        v-for="m in movies"
        :key="m.id"
        :movie="m"
        @liked="onLike"
        @rejected="onReject"
      />
    </div>
    <div v-else>Keine Ergebnisse.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import MovieCard from './MovieCard.vue';
import axios from 'axios';

export default defineComponent({
  components: { MovieCard },
  setup() {
    const query = ref('');
    const movies = ref<Array<{ id: number; title: string; coverUrl: string }>>([]);

    const searchMovies = async () => {
      try {
        const res = await axios.get(`https://api.moviefinder.stephanhagmann.ch/movies/search`, { params: { q: query.value } });
        movies.value = res.data;
      } catch (e) {
        console.error(e);
      }
    };

    const onLike = (id: number) => {
      console.log('Liked', id);
      // z.B. axios.post(`/movies/${id}/like`)
      movies.value = movies.value.filter(m => m.id !== id);
    };

    const onReject = (id: number) => {
      console.log('Rejected', id);
      movies.value = movies.value.filter(m => m.id !== id);
    };

    return { query, movies, searchMovies, onLike, onReject };
  }
});
</script>