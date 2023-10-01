// demonstrate seed reset
// for (let i = 0; i < 10; i++) {
//   console.log(i, $fx.rand(), $fx.randminter())
//   $fx.rand.reset();
//   $fx.randminter.reset();
// }

const sp = new URLSearchParams(window.location.search)
//  console.log(sp);

// this is how to define parameters
$fx.params([
  {
    id: "number_id",
    name: "A number/float64",
    type: "number",
    //default: Math.PI,
    options: {
      min: 1,
      max: 10,
      step: 0.0001,
    },
  },

  {
    id: "bigint_id",
    name: "A bigint",
    type: "bigint",
    update: "code-driven",
    //default: BigInt(Number.MAX_SAFE_INTEGER * 2),
    options: {
      min: Number.MIN_SAFE_INTEGER * 4,
      max: Number.MAX_SAFE_INTEGER * 4,
      step: 1,
    },
  },
  {
    id: "string_id_long",
    name: "A string long",
    type: "string",
    update: "code-driven",
    //default: "hello",
    options: {
      minLength: 1,
      maxLength: 512,
    },
  },
  {
    id: "select_id",
    name: "A selection",
    type: "select",
    update: "code-driven",
    //default: "pear",
    options: {
      options: ["apple", "orange", "pear"],
    },
  },
  {
    id: "color_id",
    name: "A color",
    type: "color",
    update: "code-driven",
    //default: "ff0000",
  },
  {
    id: "boolean_id",
    name: "A boolean",
    type: "boolean",
    update: "code-driven",
    //default: true,
  },
  {
    id: "string_id",
    name: "A string",
    type: "string",
    update: "code-driven",
    //default: "hello",
    options: {
      minLength: 1,
      maxLength: 512,
    },
  },
])

// this is how features can be defined
$fx.features({
  "A random feature": Math.floor($fx.rand() * 10),
  "A random boolean": $fx.rand() > 0.5,
  "A random string": ["A", "B", "C", "D"].at(Math.floor($fx.rand() * 4)),
  "Feature from params, its a number": $fx.getParam("number_id"),
})

function main() {
  // log the parameters, for debugging purposes, artists won't have to do that
  // console.log("Current param values:");
  // // Raw deserialize param values
  // console.log($fx.getRawParams());
  // // Added addtional transformation to the parameter for easier usage
  // // e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
  // console.log($fx.getParams());

  // // how to read a single raw parameter
  // console.log("Single raw value:");
  // console.log($fx.getRawParam("color_id"));
  // // how to read a single transformed parameter
  // console.log("Single transformed value:");
  // console.log($fx.getParam("color_id"));

  const getContrastTextColor = backgroundColor =>
    ((parseInt(backgroundColor, 16) >> 16) & 0xff) > 0xaa
      ? "#000000"
      : "#ffffff"

  const bgcolor = $fx.getParam("color_id").hex.rgba
  const textcolor = getContrastTextColor(bgcolor.replace("#", ""))

  // update the document based on the parameters
  document.body.style.background = bgcolor
  document.body.innerHTML = `
  <div style="color: ${textcolor};">
    <p>
    hash: ${$fx.hash}
    </p>
    <p>
    minter: ${$fx.minter}
    </p>
    <p>
    iteration: ${$fx.iteration}
    </p>
    <p>
    inputBytes: ${$fx.inputBytes}
    </p>
    <p>
    context: ${$fx.context}
    </p>
    <p>
    params:
    </p>
    <pre>
    ${$fx.stringifyParams($fx.getRawParams())}
    </pre>
  <div>
  `
  const btn = document.createElement("button")
  btn.textContent = "emit random params"
  btn.addEventListener("click", () => {
    $fx.emit("params:update", {
      number_id: $fx.getRandomParam("number_id"),
      bigint_id: $fx.getRandomParam("bigint_id"),
      string_id_long: $fx.getRandomParam("string_id_long"),
      select_id: $fx.getRandomParam("select_id"),
      color_id: $fx.getRandomParam("color_id"),
      boolean_id: $fx.getRandomParam("boolean_id"),
      string_id: $fx.getRandomParam("string_id"),
    })
    main()
  })
  document.body.appendChild(btn)
}

main()

$fx.on(
  "params:update",
  newRawValues => {
    // opt-out default behaviour
    if (newRawValues.number_id === 5) return false
    // opt-in default behaviour
    return true
  },
  (optInDefault, newValues) => main()
)
