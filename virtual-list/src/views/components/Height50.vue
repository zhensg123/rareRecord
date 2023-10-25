<template>
    <div style="height:50px;border:1px solid #333;">
        height: 50px--{{ index }}
    </div>
</template>
<script>
export default {
    props: ['index']
}
</script>