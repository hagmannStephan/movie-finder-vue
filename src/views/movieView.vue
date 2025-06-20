<script setup lang="ts">
import MovieList from '../components/MovieList.vue'
import MovieCard from '../components/MovieCard.vue'

const sampleMovie = {
  id: 1,
  title: 'The Matrix',
  coverUrl: 'https://via.placeholder.com/200x300?text=The+Matrix'
}
</script>

<template>
  <div>
    <h1>Filme</h1>
    <MovieList />
    <MovieCard :movie="sampleMovie" @liked="onLiked" @rejected="onRejected" />
  </div>
</template>

<script lang="ts">
function onLiked(id: number) {
  console.log('Liked movie with id:', id);
}

function onRejected(id: number) {
  console.log('Rejected movie with id:', id);
}
</script>
