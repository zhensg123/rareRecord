<template>
    <div style="height:30px;border:1px solid #333;">
        height: 30px---{{ index }}
    </div>
</template>
<script>
export default {
  props: ['index']
}
</script>