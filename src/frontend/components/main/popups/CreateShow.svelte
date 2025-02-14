<script lang="ts">
    import { MAIN } from "../../../../types/Channels"
    import { ShowObj } from "../../../classes/Show"
    import { convertText, getQuickExample } from "../../../converters/txt"
    import { activePopup, activeProject, activeShow, categories, dictionary, drawerTabsData, formatNewShow, quickTextCache, shows, splitLines } from "../../../stores"
    import { newToast } from "../../../utils/messages"
    import { receive, send } from "../../../utils/request"
    import { sortObject } from "../../helpers/array"
    import { history } from "../../helpers/history"
    import Icon from "../../helpers/Icon.svelte"
    import { checkName } from "../../helpers/show"
    import T from "../../helpers/T.svelte"
    import Button from "../../inputs/Button.svelte"
    import Checkbox from "../../inputs/Checkbox.svelte"
    import CombinedInput from "../../inputs/CombinedInput.svelte"
    import Dropdown from "../../inputs/Dropdown.svelte"
    import NumberInput from "../../inputs/NumberInput.svelte"
    import TextArea from "../../inputs/TextArea.svelte"
    import TextInput from "../../inputs/TextInput.svelte"
    import Loader from "../Loader.svelte"

    function textToShow() {
        let sections = values.text.split("\n\n").filter((a: any) => a.length)

        // let metaData: string = ""
        // if (sections[1] && sections[0]?.split("\n").length < 3) metaData = sections.splice(0, 1)[0]
        let category = selectedCategory.id.length ? selectedCategory.id : null

        if (sections.length) {
            convertText({ name: values.name, category, text: values.text })
        } else {
            let show = new ShowObj(false, category)
            show.name = checkName(values.name)
            history({ id: "UPDATE", newData: { data: show, remember: { project: $activeProject } }, location: { page: "show", id: "show" } })
        }

        values = { name: "", text: "" }
        quickTextCache.set("")
        activePopup.set(null)
    }

    const changeValue = (e: any, key: string = "text") => {
        values[key] = e.target.value

        // store text if popup is closed
        if (key === "text") quickTextCache.set(values.text)
    }
    let values: any = {
        text: $quickTextCache.length > 20 ? $quickTextCache : "",
        name: "",
    }

    function keydown(e: any) {
        if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return

        if (document.activeElement?.closest("#name")) {
            e.preventDefault()
            searchLyrics()
            return
        }

        ;(document.activeElement as any)?.blur()
        textToShow()
    }

    const cats: any = [
        { id: "", name: "—" },
        ...sortObject(
            Object.keys($categories).map((id) => ({ id, name: $categories[id].default ? `$:${$categories[id].name}:$` : $categories[id].name })),
            "name"
        ),
    ]

    let selectedCategory: any = cats[0]
    // get the selected category
    if ($drawerTabsData.shows?.activeSubTab && $categories[$drawerTabsData.shows.activeSubTab]) selectedCategory = cats.find((a: any) => a.id === $drawerTabsData.shows.activeSubTab)
    // get the category from the active show
    else if ($shows[$activeShow?.id || ""]?.category) selectedCategory = cats.find((a: any) => a.id === $shows[$activeShow?.id || ""]?.category)

    const inputs: any = {
        formatNewShow: (e: any) => formatNewShow.set(e.target.checked),
    }

    let showMore: boolean = false
    let activateLyrics: boolean = !!values.text.length

    let loading = false
    function searchLyrics() {
        let artist = ""
        let title = values.name
        if (!title) {
            newToast("$toast.no_name")
            return
        }

        send(MAIN, ["SEARCH_LYRICS"], { artist, title })
        loading = true
    }

    // encode using btoa()
    const blockedWords = ["ZnVjaw==", "Yml0Y2g=", "bmlnZ2E="]
    receive(MAIN, {
        SEARCH_LYRICS: (data) => {
            loading = false

            // filter out songs with bad words
            blockedWords.forEach((eWord) => {
                let word = atob(eWord)
                if (data.lyrics.includes(word)) data.lyrics = ""
            })

            if (!data.lyrics) {
                newToast("$toast.lyrics_undefined")
                return
            }

            values.text = data.lyrics
            activateLyrics = true
            newToast("$toast.lyrics_copied")
        },
    })
</script>

<svelte:window on:keydown={keydown} />

<CombinedInput textWidth={30}>
    <p><T id="show.name" /></p>
    <TextInput id="name" autofocus value={values.name} on:input={(e) => changeValue(e, "name")} style="height: 30px;" />
    <div class="search" class:loading>
        {#if loading}
            <Loader />
        {:else}
            <Button on:click={searchLyrics} title={$dictionary.create_show?.search_web}>
                <Icon id="search" size={1.2} white />
            </Button>
        {/if}
    </div>
</CombinedInput>

<CombinedInput textWidth={30}>
    <p><T id="show.category" /></p>
    <Dropdown options={cats} value={selectedCategory?.name} on:click={(e) => (selectedCategory = e.detail)} />
</CombinedInput>

{#if showMore}
    <CombinedInput textWidth={30}>
        <p><T id="create_show.format_new_show" /></p>
        <div class="alignRight">
            <Checkbox checked={$formatNewShow} on:change={inputs.formatNewShow} />
        </div>
    </CombinedInput>
    <CombinedInput textWidth={30}>
        <p><T id="create_show.split_lines" /></p>
        <NumberInput
            disabled={!$formatNewShow}
            value={$splitLines}
            max={100}
            on:change={(e) => {
                splitLines.set(e.detail)
            }}
        />
    </CombinedInput>
{:else}
    <CombinedInput>
        <Button on:click={() => (showMore = !showMore)} style="width: 100%;" dark center>
            <Icon id="options" right white={showMore} />
            <T id="create_show.more_options" />
        </Button>
    </CombinedInput>
{/if}

<Button on:click={() => (activateLyrics = !activateLyrics)} style="margin-top: 10px;" dark center>
    <Icon id="text" right white={activateLyrics} />
    <T id="show.quick_lyrics" />
</Button>

{#if activateLyrics}
    <!-- <span><T id="show.quick_lyrics" /></span> -->
    <TextArea placeholder={getQuickExample()} style="height: 250px;min-width: 500px;" value={values.text} on:input={(e) => changeValue(e)} />
{/if}

<Button on:click={textToShow} style="width: 100%;margin-top: 10px;" dark center>
    {#if values.text.trim().length > 0}
        <Icon id="showIcon" right />
        <T id="new.show" />
    {:else}
        <Icon id="showIcon" right white />
        <T id="new.empty_show" />
    {/if}
</Button>

<style>
    .search {
        display: flex;
        align-items: center;

        align-self: center;
    }
    .search.loading {
        padding: 0 6px;
    }

    /* loader */
    .search :global(div) {
        width: 25px;
        height: 25px;
    }
</style>
