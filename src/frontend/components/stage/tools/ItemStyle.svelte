<script lang="ts">
    import { activeStage, stageShows } from "../../../stores"
    import { addStyleString } from "../../edit/scripts/textStyle"
    import EditValues from "../../edit/tools/EditValues.svelte"
    import { itemEdits } from "../../edit/values/item"
    import { history } from "../../helpers/history"
    import { getStyles } from "../../helpers/style"
    import T from "../../helpers/T.svelte"
    import Center from "../../system/Center.svelte"
    import { updateStageShow } from "../stage"

    $: items = $activeStage.items
    $: stageItems = $stageShows[$activeStage.id!].items
    $: item = items ? stageItems[items[0]] : null

    let data: { [key: string]: any } = {}
    $: if (item?.style || item === null) data = getStyles(item?.style, true)

    function updateStyle(e: any) {
        let input = e.detail

        let value: string = addStyleString(item!.style, [input.key, input.value]) || ""

        if (input.id === "CSS") value = input.value.replaceAll("\n", "")

        if (!value) return

        console.log(item?.style, value)

        history({ id: "UPDATE", newData: { data: value, key: "items", subkey: "style", keys: items }, oldData: { id: $activeStage.id }, location: { page: "stage", id: "stage_item_style", override: $activeStage.id + items.join("") } })

        if (!timeout) {
            updateStageShow()
            timeout = setTimeout(() => {
                updateStageShow()
                timeout = null
            }, 500)
        }
    }

    let timeout: any = null
</script>

{#if item}
    <EditValues edits={itemEdits} styles={data} {item} on:change={updateStyle} />
{:else}
    <Center faded>
        <T id="empty.items" />
    </Center>
{/if}
