<script lang="ts">
    import { OUTPUT } from "../../../types/Channels"
    import { activeTimers, dictionary } from "../../stores"
    import { send } from "../../utils/request"
    import { getAudioDuration } from "../helpers/audio"
    import { history } from "../helpers/history"
    import Icon from "../helpers/Icon.svelte"
    import { _show } from "../helpers/shows"
    import { joinTime, secondsToTime } from "../helpers/time"
    import Button from "../inputs/Button.svelte"

    export let timer: any
    export let layoutSlide: any
    export let background: any
    export let duration: any
    export let columns: number
    export let index: number
    export let style: string

    $: videoDuration = duration ? joinTime(secondsToTime(duration)) : null
    $: muted = background?.muted !== false

    $: nextTimer = (layoutSlide.nextTimer || 0) > 0 ? (layoutSlide.nextTimer > 59 ? joinTime(secondsToTime(layoutSlide.nextTimer)) : layoutSlide.nextTimer + "s") : null
    $: transition = layoutSlide?.transition || layoutSlide?.mediaTransition

    function removeLayout(key: string) {
        history({ id: "SHOW_LAYOUT", newData: { key, indexes: [index] } })
    }

    // TODO: history
    function mute() {
        _show("active").media([layoutSlide.background]).set({ key: "muted", value: false })
    }

    function resetTimer() {
        activeTimers.update((a) => {
            a = a.filter((_a, i) => !timer.includes(i))
            return a
        })
        send(OUTPUT, ["ACTIVE_TIMERS"], $activeTimers)
    }

    $: audio = layoutSlide.audio?.length ? _show("active").get().media[layoutSlide.audio[0]] || {} : {}
    $: audioPath = audio.path
    // no need for cloud when audio can be stacked
    // $: cloudId = $driveData.mediaId
    // $: audioPath = cloudId && cloudId !== "default" ? audio.cloud?.[cloudId] || audio.path : audio.path
</script>

<!-- TODO: check if exists -->
<div class="icons" style="zoom: {4 / columns};{style}">
    {#if timer.length}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.timer} on:click={() => resetTimer()}>
                    <Icon id="timer" size={0.9} white />
                </Button>
            </div>
            {#if timer.length > 1}
                <span><p>{timer.length}</p></span>
            {/if}
        </div>
    {/if}
    {#if nextTimer}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.nextTimer} on:click={() => removeLayout("nextTimer")}>
                    <Icon id="clock" size={0.9} white />
                </Button>
            </div>
            <span><p>{nextTimer}</p></span>
        </div>
    {/if}
    {#if layoutSlide.end}
        <!-- WIP move this to Actions.svelte (right side) -->
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.to_start} on:click={() => removeLayout("end")}>
                    <Icon id="restart" size={0.9} white />
                </Button>
            </div>
        </div>
    {/if}
    {#if transition}
        <div>
            <div class="button">
                <Button
                    style="padding: 3px;"
                    redHover
                    title={$dictionary.remove?.transition}
                    on:click={() => {
                        removeLayout("transition")
                        removeLayout("mediaTransition")
                    }}
                >
                    <Icon id="transition" size={0.9} white />
                </Button>
            </div>
        </div>
    {/if}
    {#if background}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.background} on:click={() => removeLayout("background")}>
                    <Icon id={["camera", "screen"].includes(background.type) ? background.type : background.path?.includes("http") ? "web" : "image"} size={0.9} white />
                </Button>
            </div>
            {#if videoDuration}
                <span><p>{videoDuration}</p></span>
            {/if}
        </div>
    {/if}
    {#if background && muted && duration}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.actions?.unmute} on:click={() => mute()}>
                    <Icon id="muted" size={0.9} white />
                </Button>
            </div>
        </div>
    {/if}
    {#if layoutSlide.mics?.length}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.actions?.remove} on:click={() => removeLayout("mics")}>
                    <Icon id="microphone" size={0.9} white />
                </Button>
            </div>
            {#if layoutSlide.mics.length > 1}
                <span>
                    <p>{layoutSlide.mics.length}</p>
                </span>
            {/if}
        </div>
    {/if}
    {#if layoutSlide.audio?.length}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.audio} on:click={() => removeLayout("audio")}>
                    <Icon id="audio" size={0.9} white />
                </Button>
            </div>
            <span>
                {#if layoutSlide.audio.length === 1}
                    {#await getAudioDuration(audioPath || "")}
                        <p>00:00</p>
                    {:then duration}
                        <p>{joinTime(secondsToTime(duration))}</p>
                    {/await}
                {:else}
                    <p>{layoutSlide.audio.length}</p>
                {/if}
            </span>
        </div>
    {/if}
    {#if layoutSlide.overlays?.length}
        <div>
            <div class="button">
                <Button style="padding: 3px;" redHover title={$dictionary.remove?.overlays} on:click={() => removeLayout("overlays")}>
                    <Icon id="overlays" size={0.9} white />
                </Button>
            </div>
            {#if layoutSlide.overlays.length > 1}
                <span><p>{layoutSlide.overlays.length}</p></span>
            {/if}
        </div>
    {/if}
</div>

<style>
    .icons {
        pointer-events: none;
        display: flex;
        flex-direction: column;
        position: absolute;
        z-index: 1;
        font-size: 0.9em;

        height: 80%;
        flex-wrap: wrap;
    }
    .icons div {
        opacity: 0.9;
        display: flex;
    }
    .icons .button {
        background-color: rgb(0 0 0 / 0.6);
        pointer-events: all;
    }
    .icons span {
        pointer-events: all;
        background-color: rgb(0 0 0 / 0.6);
        padding: 3px;
        font-size: 0.75em;
        font-weight: bold;
        display: flex;
        align-items: center;
    }
</style>
