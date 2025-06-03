import { Collapse } from "./collapse.ts";
import { assert, assertEquals } from '@std/assert'

Deno.test('Collapse.collapse', async () => {
  class Collapsible extends Collapse<{ collapsed: true }> {
    constructor() {
      super(() => ({ collapsed: true }));
    }
  }
  const collapsible = new Collapsible()
  assert(await Collapse.collapse(collapsible))
  assertEquals(Reflect.get(collapsible, 'collapsed'), true)
})

Deno.test('CollapseError', async () => {
  class Collapsible extends Collapse<{ collapsed: true }> {
    constructor() {
      super(() => ({ collapsed: true }));
    }

    collapse(): { collapsed: true } {
      throw new Collapse.CollapseTransform(x => x as { collapsed: true })
    }
  }
  const collapsible = new Collapsible()
  const collapsed = collapsible.collapse()
  assertEquals(collapsed.collapsed, true)
})
