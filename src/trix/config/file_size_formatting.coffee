#= require trix/config/lang

{lang} = Trix.config
sizes = [lang.bytes, lang.KB, lang.MB, lang.GB, lang.TB, lang.PB]

Trix.config.fileSize =
  prefix: "IEC"
  precision: 2

  formatter: (number) ->
    switch number
      when 0 then "0 #{lang.bytes}"
      when 1 then "1 #{lang.byte}"
      else
        base = switch @prefix
          when "SI"  then 1000
          when "IEC" then 1024
        exp = Math.floor(Math.log(number) / Math.log(base))
        humanSize = number / Math.pow(base, exp)
        string = humanSize.toFixed(@precision)
        withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "")
        "#{withoutInsignificantZeros} #{sizes[exp]}"
