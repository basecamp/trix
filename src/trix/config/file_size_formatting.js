/* eslint-disable
    no-case-declarations,
*/
import lang from "trix/config/lang"

const sizes = [ lang.bytes, lang.KB, lang.MB, lang.GB, lang.TB, lang.PB ]

export default {
  prefix: "IEC",
  precision: 2,

  formatter(number) {
    switch (number) {
      case 0:
        return `0 ${lang.bytes}`
      case 1:
        return `1 ${lang.byte}`
      default:
        let base

        if (this.prefix === "SI") {
          base = 1000
        } else if (this.prefix === "IEC") {
          base = 1024
        }

        const exp = Math.floor(Math.log(number) / Math.log(base))
        const humanSize = number / Math.pow(base, exp)
        const string = humanSize.toFixed(this.precision)
        const withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "")
        return `${withoutInsignificantZeros} ${sizes[exp]}`
    }
  },
}
