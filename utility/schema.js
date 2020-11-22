var B2C =  {
    "type": "object",
    "required": [
      "pos",
      "state_cd",
      "add_rt",
      "sup_typ",
      "val"
    ],
    "properties": {
      "pos": {
        "type": "string",
        "pattern": "^(.*)$"
      },
      "state_cd": {
        "type": "integer",
        "pattern": "^([0-9]{2})$"
      },
      "add_rt": {
        "type": "integer"
      },
      "sup_typ": {
        "type": "string",
        "pattern": "^(.*)$"
      },
      "val": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "tax_val",
            "igst",
            "cgst",
            "sgst",
            "cess"
          ],
          "properties": {
            "tax_val": {
              "type": "integer"
            },
            "igst": {
              "type": "integer"
            },
            "cgst": {
              "type": "integer"
            },
            "sgst": {
              "type": "integer"
            },
            "cess": {
              "type": "integer"
            }
          }
        }
      }
    }
 }

 module.exports = {
     B2C : B2C
 }