// Prioriza el graphify oficial instalado con uv (~/.local/bin) frente al
// paquete graphify-cli que aparece antes en el PATH del sistema.
export const GraphifyPathPlugin = async () => ({
  "shell.env": async (_input, output) => {
    const bin = `${process.env.HOME}/.local/bin`;
    const actual = output.env.PATH ?? process.env.PATH ?? "";
    output.env.PATH = `${bin}:${actual}`;
  },
});
