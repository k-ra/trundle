<script lang="ts">
    import Map from "$lib/map.svelte";
    import Sign from "$lib/sign.svelte";
    import { map } from "../stores/currentpage.js";
</script>

<body>
    <div
        class="page"
        style={$map
            ? "background-image: none;"
            : "background-image: url(grass.jpg);"}
    >
        <Map />
        <Sign />

        <h1 class="title">trundle</h1>
    </div>
</body>

<style>
    .page {
        width: 100vw;
        height: 100vh;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
        margin: 0px;
    }

    body {
        margin: 0px;
    }

    .title {
        position: fixed;
        top: -18px;
        right: 50px;
        font-size: 40pt;
        font-weight: normal;
        text-align: center;
    }
</style>
