import { Collapse } from "./collapse.ts";
import { assert, assertEquals } from "@std/assert";

Deno.test("Collapse.collapse", async () => {
  class Collapsible extends Collapse<{ collapsed: true }> {
    constructor() {
      super(() => ({ collapsed: true }));
    }
  }
  const collapsible = new Collapsible();
  assert(await Collapse.collapse(collapsible));
  assertEquals(Reflect.get(collapsible, "collapsed"), true);
});

Deno.test("Collapse.Transform", () => {
  class Collapsible extends Collapse<{ collapsed: true }> {
    constructor() {
      super(() => ({ collapsed: true }));
    }

    collapse(): { collapsed: true } {
      throw new Collapse.Transform((x) => x as { collapsed: true });
    }
  }
  const collapsible = new Collapsible();
  const collapsed = collapsible.collapse();
  assertEquals(collapsed.collapsed, true);
});

Deno.test("Collapse.Transform (async)", async () => {
  class Collapsible extends Collapse<{ collapsed: true }> {
    constructor() {
      super(() => Promise.resolve({ collapsed: true }));
    }

    collapse(): Promise<{ collapsed: true }> {
      throw new Collapse.Transform((x) => x as { collapsed: true });
    }
  }
  const collapsible = new Collapsible();
  const collapsed = await collapsible.collapse();
  assertEquals(collapsed.collapsed, true);
});

Deno.test("Collapse.To", () => {
  class Collapsible extends Collapse<{ collapsed: string }> {
    constructor() {
      super(() => ({ collapsed: "ctor" }));
    }

    collapse(): "collapse()" {
      throw new Collapse.To((_) =>
        [{ collapsed: "collapse" }, "collapse()"] as const
      );
    }
  }
  const collapsible = new Collapsible();
  const collapsed = collapsible.collapse();
  assertEquals(collapsed, "collapse()");
  assertEquals(Reflect.get(collapsible, "collapsed"), "collapse");
});

Deno.test("Collapse.To (async)", async () => {
  class Collapsible extends Collapse<{ collapsed: string }> {
    constructor() {
      super(() => ({ collapsed: "ctor" }));
    }

    collapse(): Promise<"collapse()"> {
      throw new Collapse.To((_) =>
        Promise.resolve([{ collapsed: "collapse" }, "collapse()"] as const)
      );
    }
  }
  const collapsible = new Collapsible();
  const collapsed = await collapsible.collapse();
  assertEquals(collapsed, "collapse()");
  assertEquals(Reflect.get(collapsible, "collapsed"), "collapse");
});
