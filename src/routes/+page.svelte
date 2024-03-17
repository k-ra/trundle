<script lang="ts">
    import Map from "$lib/stopmap.svelte";
    import Sign from "$lib/sign.svelte";
</script>

<div class="page">
    <Map />
    <Sign />
    <h1 id="this" style="font-weight: normal;">trundle</h1>
</div>

<style>
    .page {
        width: 99vw;
        height: 98vh;
        background-image: url("grass.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
    }

    #this {
        position: fixed;
        top: 8px;
        right: 50px;
        font-size: 30pt;
        text-align: center;
    }
</style>
