
export const world110m = {
  "type": "Topology",
  "objects": {
    "land": {
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "MultiPolygon",
          "arcs": [
            [
              [0, 1, 2, 3]
            ]
          ]
        }
      ]
    },
    "countries": {
      "type": "GeometryCollection",
      "geometries": []
    }
  },
  "arcs": [
    [
      [180, 90],
      [-180, 90]
    ],
    [
      [-180, 90],
      [-180, -90]
    ],
    [
      [-180, -90],
      [180, -90]
    ],
    [
      [180, -90],
      [180, 90]
    ]
  ],
  "transform": {
    "scale": [
      0.0036036036036036037,
      0.0018018018018018018
    ],
    "translate": [
      -180,
      -90
    ]
  }
};
