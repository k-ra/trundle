<script lang="ts">
    import Map from "$lib/stopmap.svelte";
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
        <div class="footer">
            <h1 id="this" style="font-weight: normal;">trundle</h1>
        </div>
    </div>
</body>

<style>
    .page {
        width: 99vw;
        height: 98vh;
        background-image: url("grass.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
        margin: 0px;
    }

    body {
        margin: 0px;
    }

    #this {
        position: fixed;
        top: 8px;
        right: 50px;
        font-size: 40pt;
        text-align: center;
    }
</style>
