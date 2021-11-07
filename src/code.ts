// Service functions

// 'clone' function taken from https://www.figma.com/plugin-docs/editing-properties/
function clone(val) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}

// Change 'color' by shifting all its RGB channels to specified 'amount'
// Positive 'amount' — lighten the color
// Negative 'amount' — darken the color
function changeColor(color, amount) {
  const newColor = clone(color)
  newColor.color.r += amount
  newColor.color.g += amount
  newColor.color.b += amount

  // Saturate underflows and overflows

  if (newColor.color.r < 0) {
    newColor.color.r = 0
  } else if (newColor.color.r > 1) {
    newColor.color.r = 1
  }

  if (newColor.color.g < 0) {
    newColor.color.g = 0
  } else if (newColor.color.g > 1) {
    newColor.color.g = 1
  }

  if (newColor.color.b < 0) {
    newColor.color.b = 0
  } else if (newColor.color.b > 1) {
    newColor.color.b = 1
  }
  
  return newColor
}

function createRect(color) {
  const rect = figma.createRectangle();
  rect.fills = [{type: 'SOLID', color: {r: color.color.r, g: color.color.g, b: color.color.b}}]
  
  return rect
}

function placeObjectsOnCanvas(objects) {
  for (let i = 0; i < objects.length; i++) {
    objects[i].x = figma.viewport.center.x + i * 120
    objects[i].y = figma.viewport.center.y

    figma.currentPage.appendChild(objects[i]);
  }
}

// Plugin logic
if (figma.currentPage.selection[0].type == 'RECTANGLE') {

  const colorPreviews: Rect[] = [];

  const baseColor = clone(figma.currentPage.selection[0].fills[0])

  // Create a Default button preview
  const defaultRectangle = createRect(baseColor)
  colorPreviews.push(defaultRectangle)

  // Create a Hover button preview
  const lighterColor = changeColor(baseColor, 0.15)
  const lighterRectangle = createRect(lighterColor)
  colorPreviews.push(lighterRectangle)

  // Create a Pressed button preview
  const darkerColor = changeColor(baseColor, -0.15)
  const darkerRectangle = createRect(darkerColor)
  colorPreviews.push(darkerRectangle)

  // Place button color samples
  placeObjectsOnCanvas(colorPreviews)
}

figma.closePlugin();
