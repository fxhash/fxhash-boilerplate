/**

   ▄████████ ▀████    ▐████▀    ▄█    █▄       ▄████████  ▄████████    ▄█   ▄█▄    ▄████████     ███        ▄█    █▄     ▄██████▄  ███▄▄▄▄   
  ███    ███   ███▌   ████▀    ███    ███     ███    ███ ███    ███   ███ ▄███▀   ███    ███ ▀█████████▄   ███    ███   ███    ███ ███▀▀▀██▄ 
  ███    █▀     ███  ▐███      ███    ███     ███    ███ ███    █▀    ███▐██▀     ███    ███    ▀███▀▀██   ███    ███   ███    ███ ███   ███ 
 ▄███▄▄▄        ▀███▄███▀     ▄███▄▄▄▄███▄▄   ███    ███ ███         ▄█████▀      ███    ███     ███   ▀  ▄███▄▄▄▄███▄▄ ███    ███ ███   ███ 
▀▀███▀▀▀        ████▀██▄     ▀▀███▀▀▀▀███▀  ▀███████████ ███        ▀▀█████▄    ▀███████████     ███     ▀▀███▀▀▀▀███▀  ███    ███ ███   ███ 
  ███          ▐███  ▀███      ███    ███     ███    ███ ███    █▄    ███▐██▄     ███    ███     ███       ███    ███   ███    ███ ███   ███ 
  ███         ▄███     ███▄    ███    ███     ███    ███ ███    ███   ███ ▀███▄   ███    ███     ███       ███    ███   ███    ███ ███   ███ 
  ███        ████       ███▄   ███    █▀      ███    █▀  ████████▀    ███   ▀█▀   ███    █▀     ▄████▀     ███    █▀     ▀██████▀   ▀█   █▀  
                                                                      ▀
 * This code serves as an example to demonstrate how to leverage the new param
 * features providing the backbones of the fxhackathon 2023: co-creation 
 * interfaces.
 * 
 * A new update mode was made available: "code-driven". It comes as an addition
 * to the already-existing "page-reload" (default) and "sync" modes, which both
 * rely on a 1-way modulation of the params at mint time: interface with 
 * controls -> injected into the code.
 * 
 * "code-driven" params are params which are only modulated from the code, not
 * from the fxhash minting interface. Which means that projects can now embed
 * their own minting interface, opening up the way of many novel use-cases.
 * 
 * Moreover, a new context flag was introduced to make your code aware of the
 * context in which it's being ran: "standalone", "minting", "capture". With
 * the context flag, you can trigger your code to:
 *  - "standalone", "capture": display the final piece
 *  - "minting": display the minting interface
 */

import final from "./final"
import minting from "./minting"

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// params are defined at the top-level
// you must define the same params in minting and live context, otherwise the
// project will break
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

$fx.params([
  {
    id: "x",
    name: "X pos",
    type: "number",
    update: "code-driven", // the parameter is manipulated with code
    default: 0.5,
    options: {
      min: 0,
      max: 1,
      step: 0.000001,
    },
  },
  {
    id: "y",
    name: "Y pos",
    type: "number",
    update: "code-driven", // the parameter is manipulated with code
    default: 0.5,
    options: {
      min: 0,
      max: 1,
      step: 0.000001,
    },
  },
  {
    id: "size",
    name: "Size",
    type: "number",
    update: "code-driven",
    default: 0.02,
    options: {
      min: 0.01,
      max: 0.2,
      step: 0.00001,
    },
  },
])

// we add the context as a class to the body, this way we can fine-tune the
// elements in CSS based on the context
document.body.classList.add($fx.context)

// the piece is executed in "minting" mode; so we need to display a custom
// minting interface; this can be anything, it doesn't have to be some code
// running separately; it can also be some interface layered on top of the
// final output
if ($fx.context === "minting") {
  minting() // see minting.js for implementation
}
// the piece is ran by itself, for the final output or for the capture
// for instance - in such a case we render the final output based on the inputs
else {
  // $fx.context === "standalone" || $fx.context === "capture"
  final() // see final.js for implementation
}
