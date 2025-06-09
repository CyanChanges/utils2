export let CGROUP_TEMPLATE = {
  "compile-limited": [
    "CPUQuota=1280%",
    "CPUWeight=90",
  ],
  "compile-high": [
    "CPUQuota=1280%",
    "CPUWeight=120",
  ],
};
export type Templates = typeof CGROUP_TEMPLATE;
export let TEMPLATE_ALIAS = {
  cl: "compile-limited",
  ch: "compile-high",
};

function generateProperties(templates: (keyof Templates)[]) {
  return templates
    .map((name) => CGROUP_TEMPLATE[name])
    .flatMap((templ) => {
      return templ.map((prop) => `--property=${prop}`);
    });
}

function createCommand(
  templates: (keyof Templates)[],
  program: string[],
) {
  return new Deno.Command("systemd-run", {
    args: [
      "--scope",
      "--user",
      ...generateProperties(templates),
      "--collect",
      ...program,
    ],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const program = [];
  const templates = [];
  for (const arg of Deno.args) {
    if (!program.length && arg.startsWith("+")) {
      let templ_name = arg.slice(1);
      if (Reflect.has(TEMPLATE_ALIAS, templ_name)) {
        templ_name = Reflect.get(TEMPLATE_ALIAS, templ_name);
      }
      if (!templ_name) throw new TypeError(`Unknown template ${arg.slice(1)}`);
      templates.push(templ_name);
    } else {
      program.push(arg);
    }
  }
  const command = createCommand(templates as (keyof Templates)[], program);
  const proc = command.spawn();

  await proc.status;
}
