export interface VehicleRegistration {
  // Office Information
  fieldOffice?: string
  officeCode?: string
  dateOfIssue?: string
  certificateNumber?: string

  // Vehicle Information
  plateNumber?: string
  engineNumber?: string
  chassisNumber?: string
  vin?: string
  fileNumber?: string
  vehicleType?: string
  vehicleCategory?: string
  makeBrand?: string
  color?: string
  typeOfFuel?: string
  classification?: string
  bodyType?: string
  series?: string
  yearModel?: string
  yearRebuilt?: string
  pistonDisplacement?: string
  grossWeight?: string
  netWeight?: string
  maxPower?: string
  passengerCapacity?: string

  // Owner Information
  ownerName?: string
  ownerAddress?: string
  encumberedTo?: string

  // Registration Details
  detailsOfFirstRegistration?: string
  remarks?: string
  orNumber?: string
  orDate?: string
  amount?: string
  registrantSignature?: string
  by?: string
  chiefOfOffice?: string
  chiefOfOfficeSignature?: string
  note?: string
}

// Helper to check if a line looks like a label
function isLabel(line: string): boolean {
  const upper = line.toUpperCase().trim()
  if (upper.length < 2) return false

  // Never treat dates, amounts, or numbers as labels
  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(upper) || // Date format MM/DD/YYYY
    /^PHP\s*[\d,]+\.?\d*$/i.test(upper) || // PHP amount
    /^\d{15,}$/.test(upper)
  ) {
    // Long numbers (like O.R. numbers)
    return false
  }

  // Check if it's a known field label
  if (getFieldNameForLabel(line) !== null) {
    return true
  }

  // Common label patterns
  const labelPatterns = [
    /^(PLATE|ENGINE|CHASSIS|VIN|FILE|VEHICLE|MAKE|COLOR|TYPE|CLASSIFICATION|BODY|SERIES|YEAR|PISTON|GROSS|NET|MAX|PASSENGER|OWNER|ENCUMBERED|DETAILS|REMARKS|O\.R\.|AMOUNT|REGISTRANT|BY|CHIEF|NOTE|OFFICE|DATE)/i,
    /NO\.?$/i,
    /CAPACITY$/i,
    /DISPLACEMENT$/i,
    /WEIGHT$/i,
    /POWER$/i,
    /MODEL$/i,
    /REBUILT$/i,
    /ADDRESS$/i,
    /NAME$/i,
    /FUEL$/i,
    /CATEGORY$/i,
  ]

  // If it matches a pattern, it's likely a label
  if (labelPatterns.some((pattern) => pattern.test(upper))) {
    return true
  }

  // If it's all caps and contains label-like words, might be a label
  if (upper === upper.toUpperCase() && upper.length < 50) {
    // Check if it contains common label words
    const labelWords = [
      'NO',
      'TYPE',
      'DATE',
      'NAME',
      'ADDRESS',
      'WEIGHT',
      'POWER',
      'MODEL',
      'CAPACITY',
      'COLOR',
      'FUEL',
      'SERIES',
      'BODY',
      'MAKE',
      'BRAND',
      'CATEGORY',
      'CLASSIFICATION',
    ]
    const wordCount = labelWords.filter((word) => upper.includes(word)).length
    // If it contains multiple label words or is short, it's likely a label
    if (wordCount >= 1 && (wordCount >= 2 || upper.length < 25)) {
      return true
    }
  }

  return false
}

// Map label text to field names - order matters! More specific matches first
function getFieldNameForLabel(label: string): keyof VehicleRegistration | null {
  const upper = label.toUpperCase().trim()

  // Most specific matches first
  if (upper.includes('PLATE NO')) return 'plateNumber'
  if (upper.includes('ENGINE NO')) return 'engineNumber'
  if (upper.includes('CHASSIS NO')) return 'chassisNumber'
  if (upper === 'VIN' || (upper.includes('VIN') && !upper.includes('ENGINE')))
    return 'vin'
  if (upper.includes('FILE NO')) return 'fileNumber'
  if (upper.includes('VEHICLE TYPE')) return 'vehicleType'
  if (upper.includes('VEHICLE CATEGORY')) return 'vehicleCategory'
  if (
    upper.includes('MAKE/BRAND') ||
    upper.includes('MAKE') ||
    upper.includes('BRAND')
  )
    return 'makeBrand'
  if (upper.includes('PASSENGER CAPACITY')) return 'passengerCapacity'
  if (
    upper.includes('TYPE OF FUEL') ||
    (upper.includes('FUEL') && !upper.includes('TYPE OF'))
  )
    return 'typeOfFuel'
  if (upper.includes('CLASSIFICATION')) return 'classification'
  if (upper.includes('BODY TYPE')) return 'bodyType'
  if (upper.includes('SERIES')) return 'series'
  if (upper.includes('GROSS WEIGHT')) return 'grossWeight'
  if (upper.includes('NET WEIGHT')) return 'netWeight'
  if (upper.includes('YEAR MODEL')) return 'yearModel'
  if (upper.includes('YEAR REBUILT')) return 'yearRebuilt'
  if (upper.includes('PISTON DISPLACEMENT')) return 'pistonDisplacement'
  if (upper.includes('MAX POWER')) return 'maxPower'
  if (upper.includes('COLOR')) return 'color'
  if (
    upper.includes("OWNER'S NAME") ||
    (upper.includes('OWNER') &&
      upper.includes('NAME') &&
      !upper.includes('ADDRESS'))
  )
    return 'ownerName'
  if (
    upper.includes("OWNER'S ADDRESS") ||
    (upper.includes('OWNER') && upper.includes('ADDRESS'))
  )
    return 'ownerAddress'
  if (upper.includes('ENCUMBERED TO')) return 'encumberedTo'
  if (upper.includes('O.R. NO') || upper.includes('OR NO')) return 'orNumber'
  if (upper.includes('O.R. DATE') || upper.includes('OR DATE')) return 'orDate'
  if (upper.includes('AMOUNT')) return 'amount'
  return null
}

// Helper to check if a line is a sub-label (in parentheses)
function isSubLabel(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('(') && trimmed.endsWith(')')
}

// Extract grouped fields - labels followed by values in same order
function extractGroupedFields(
  lines: string[],
  labelGroup: string[],
  labelStartIndex: number,
): Map<string, string> {
  const result = new Map<string, string>()

  // Find where values start (after the label group)
  let valuesStartIndex = labelStartIndex + labelGroup.length

  // Skip empty lines between labels and values
  while (
    valuesStartIndex < lines.length &&
    lines[valuesStartIndex].trim().length === 0
  ) {
    valuesStartIndex++
  }

  // Extract values for each label in order - one value per label, ignore multi-line
  let valueOffset = 0
  for (let i = 0; i < labelGroup.length; i++) {
    const fieldName = getFieldNameForLabel(labelGroup[i])
    
    // Find the next valid value (skip sub-labels and empty lines)
    while (valuesStartIndex + valueOffset < lines.length) {
      const valueIndex = valuesStartIndex + valueOffset
      const value = lines[valueIndex].trim()

      // Skip empty lines
      if (value.length === 0) {
        valueOffset++
        continue
      }

      // Skip sub-labels (lines in parentheses)
      if (isSubLabel(value)) {
        valueOffset++
        continue
      }

      // If we hit a label, stop extracting values for this group
      if (isLabel(value)) {
        break
      }

      // Validate value matches expected field type
      // Special handling for YEAR MODEL - only accept 4-digit numbers
      if (fieldName === 'yearModel') {
        if (!/^(19|20)\d{2}$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Special handling for YEAR REBUILT - accept 4-digit year OR N/A
      if (fieldName === 'yearRebuilt') {
        if (value.toUpperCase() !== 'N/A' && !/^(19|20)\d{2}$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Special handling for VIN - accept alphanumeric OR N/A
      if (fieldName === 'vin') {
        if (value.toUpperCase() !== 'N/A' && !/^[A-Z0-9]+$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Validate PLATE NO - typically 6-8 chars, alphanumeric, shorter than engine numbers
      if (fieldName === 'plateNumber') {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value) || value.length > 10) {
          valueOffset++
          continue
        }
      }
      
      // Validate ENGINE NO - typically longer alphanumeric (10+ chars)
      if (fieldName === 'engineNumber') {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value) || (value.length < 10 && /^[A-Z0-9]+$/.test(value))) {
          valueOffset++
          continue
        }
      }
      
      // Validate O.R. NO - should be a long number (15+ digits typically)
      if (fieldName === 'orNumber') {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value) || /^PHP/i.test(value) || value.length < 12) {
          valueOffset++
          continue
        }
      }
      
      // Validate O.R. DATE - should be a date format
      if (fieldName === 'orDate') {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Validate AMOUNT - should contain PHP or be a number with commas/decimals
      if (fieldName === 'amount') {
        if (!/^PHP/i.test(value) && !/^[\d,]+\.?\d*$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Validate SERIES - should be text, not numbers
      if (fieldName === 'series') {
        if (/^\d+$/.test(value)) {
          valueOffset++
          continue
        }
      }
      
      // Validate GROSS WEIGHT and NET WEIGHT - should be numbers
      if (fieldName === 'grossWeight' || fieldName === 'netWeight') {
        if (!/^\d+$/.test(value) && value.toUpperCase() !== 'N/A') {
          valueOffset++
          continue
        }
      }
      
      // Found a valid value - one value per label, ignore multi-line
      result.set(labelGroup[i], value)
      valueOffset++
      break // Move to next label
    }
  }

  return result
}

export function parseLTOCertificate(rawText: string): VehicleRegistration {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const data: VehicleRegistration = {}
  const normalizedLines = lines.map((line) => line.toUpperCase())
  const processedLines = new Set<number>() // Track processed lines

  // First pass: Find and extract grouped fields
  let i = 0
  while (i < lines.length) {
    if (processedLines.has(i)) {
      i++
      continue
    }

    // Check if this line starts a group of labels
    if (isLabel(lines[i])) {
      const labelGroup: string[] = []
      let j = i

      // Collect consecutive labels (usually on separate lines)
      // Check for consecutive label lines, but stop if we hit a non-vehicle field
      while (j < lines.length && isLabel(lines[j])) {
        const fieldName = getFieldNameForLabel(lines[j])
        // Stop grouping if we hit office information fields (Date, Field Office, Office Code, CR No)
        if (fieldName === 'dateOfIssue' || 
            fieldName === 'fieldOffice' || 
            fieldName === 'officeCode' || 
            fieldName === 'certificateNumber') {
          break
        }
        labelGroup.push(lines[j])
        processedLines.add(j)
        j++
      }

      // If we have a group (2+ labels), extract values
      if (labelGroup.length >= 2) {
        // Values start after the last label line
        const values = extractGroupedFields(lines, labelGroup, i)

        // Map each label to its field and value
        labelGroup.forEach((label) => {
          const fieldName = getFieldNameForLabel(label)
          const value = values.get(label)

          if (fieldName && value) {
            // Handle special cases
            // VIN can be N/A - it's a valid value
            if (fieldName === 'netWeight' && value.toUpperCase() === 'N/A') {
              return // Skip N/A for netWeight
            }
            // YEAR REBUILT can be N/A - it's a valid value
            if (fieldName === 'maxPower' && value.toUpperCase() === 'N/A') {
              return // Skip N/A for maxPower
            }
            if (
              fieldName === 'amount' &&
              !value.toUpperCase().includes('PHP')
            ) {
              data[fieldName] = `PHP ${value}`
            } else {
              data[fieldName] = value
            }
          }
        })

        // Mark value lines as processed
        const valuesStartIndex = j
        let valueOffset = 0
        for (let k = 0; k < labelGroup.length; k++) {
          const valueIndex = valuesStartIndex + valueOffset
          if (valueIndex < lines.length && !isLabel(lines[valueIndex])) {
            processedLines.add(valueIndex)
            valueOffset++
          } else {
            break
          }
        }

        i = j + valueOffset
        continue
      }
    }

    i++
  }

  // Second pass: Extract single fields that weren't in groups
  const extractSingleField = (
    label: string,
    fieldName: keyof VehicleRegistration,
  ) => {
    // Skip if already extracted
    if (data[fieldName]) return

    const labelUpper = label.toUpperCase()
    for (let i = 0; i < normalizedLines.length; i++) {
      // Skip processed lines, but allow checking if it's the label itself
      if (processedLines.has(i) && !normalizedLines[i].includes(labelUpper))
        continue

      if (normalizedLines[i].includes(labelUpper)) {
        // Check if value is on same line
        const line = lines[i]
        const labelIndex = line.toUpperCase().indexOf(labelUpper)
        const afterLabel = line.substring(labelIndex + label.length).trim()

        if (afterLabel && !isLabel(afterLabel) && afterLabel.length > 0) {
          data[fieldName] = afterLabel
          processedLines.add(i)
          return
        }

        // Check next lines - skip sub-labels (in parentheses) and find the actual value
        let checkIndex = i + 1
        while (checkIndex < lines.length) {
          const checkLine = lines[checkIndex].trim()

          // Skip empty lines
          if (checkLine.length === 0) {
            checkIndex++
            continue
          }

          // Skip sub-labels (lines in parentheses)
          if (isSubLabel(checkLine)) {
            checkIndex++
            continue
          }

          // If we hit a label, stop looking
          if (isLabel(checkLine)) {
            break
          }

          // Special validation for YEAR MODEL - only accept 4-digit numbers
          if (fieldName === 'yearModel') {
            if (/^(19|20)\d{2}$/.test(checkLine)) {
              data[fieldName] = checkLine
              processedLines.add(i)
              processedLines.add(checkIndex)
              return
            } else {
              // Skip this value and continue looking
              checkIndex++
              continue
            }
          }

          // Found a valid value
          data[fieldName] = checkLine
          processedLines.add(i)
          processedLines.add(checkIndex)
          return
        }
      }
    }
  }

  // Office Information
  const fieldOfficeLine = lines.find(
    (line) =>
      line.toUpperCase().includes('FIELD OFFICE') ||
      line.toUpperCase().includes('DILIMAN DISTRICT'),
  )
  if (fieldOfficeLine) {
    const match =
      fieldOfficeLine.match(/Field Office\s+(.+)/i) ||
      fieldOfficeLine.match(/(DILIMAN DISTRICT OFFICE)/i)
    if (match) {
      data.fieldOffice = match[1] || match[0]
    }

    const officeCodeMatch = fieldOfficeLine.match(/Office Code\s*(\d+)/i)
    if (officeCodeMatch) {
      data.officeCode = officeCodeMatch[1]
    } else {
      extractSingleField('Office Code', 'officeCode')
    }
  } else {
    extractSingleField('Field Office', 'fieldOffice')
    extractSingleField('Office Code', 'officeCode')
  }

  extractSingleField('Date', 'dateOfIssue')
  extractSingleField('CR No.', 'certificateNumber')
  extractSingleField('CR No', 'certificateNumber')

  // Vehicle Information - fallback for single fields
  if (!data.plateNumber) extractSingleField('PLATE NO.', 'plateNumber')
  if (!data.plateNumber) extractSingleField('PLATE NO', 'plateNumber')
  if (!data.engineNumber) extractSingleField('ENGINE NO.', 'engineNumber')
  if (!data.engineNumber) extractSingleField('ENGINE NO', 'engineNumber')
  if (!data.chassisNumber) extractSingleField('CHASSIS NO.', 'chassisNumber')
  if (!data.chassisNumber) extractSingleField('CHASSIS NO', 'chassisNumber')
  if (!data.vin) extractSingleField('VIN', 'vin')
  if (!data.fileNumber) extractSingleField('FILE NO', 'fileNumber')
  if (!data.fileNumber) extractSingleField('FILE NO.', 'fileNumber')
  if (!data.vehicleType) extractSingleField('VEHICLE TYPE', 'vehicleType')
  if (!data.vehicleCategory)
    extractSingleField('VEHICLE CATEGORY', 'vehicleCategory')
  if (!data.makeBrand) extractSingleField('MAKE/BRAND', 'makeBrand')
  if (!data.makeBrand) extractSingleField('MAKE', 'makeBrand')
  if (!data.color) extractSingleField('COLOR', 'color')
  if (!data.typeOfFuel) extractSingleField('TYPE OF FUEL', 'typeOfFuel')
  if (!data.classification)
    extractSingleField('CLASSIFICATION', 'classification')
  if (!data.bodyType) extractSingleField('BODY TYPE', 'bodyType')
  if (!data.series) extractSingleField('SERIES', 'series')
  if (!data.yearModel) extractSingleField('YEAR MODEL', 'yearModel')
  if (!data.yearRebuilt) extractSingleField('YEAR REBUILT', 'yearRebuilt')
  if (!data.pistonDisplacement)
    extractSingleField('PISTON DISPLACEMENT', 'pistonDisplacement')
  if (!data.grossWeight) extractSingleField('GROSS WEIGHT', 'grossWeight')
  if (!data.netWeight) extractSingleField('NET WEIGHT', 'netWeight')
  if (!data.maxPower) extractSingleField('MAX POWER', 'maxPower')
  if (!data.passengerCapacity)
    extractSingleField('PASSENGER CAPACITY', 'passengerCapacity')

  // Owner Information
  if (!data.ownerName) extractSingleField("OWNER'S NAME", 'ownerName')
  if (!data.ownerName) extractSingleField('OWNER NAME', 'ownerName')

  // Owner address might be multi-line
  if (!data.ownerAddress) {
    const ownerAddressIndex = normalizedLines.findIndex((line) =>
      line.includes("OWNER'S ADDRESS"),
    )
    if (ownerAddressIndex === -1) {
      extractSingleField('OWNER ADDRESS', 'ownerAddress')
    } else {
      const addressParts: string[] = []
      for (
        let i = ownerAddressIndex + 1;
        i < Math.min(ownerAddressIndex + 4, lines.length);
        i++
      ) {
        if (!isLabel(lines[i]) && lines[i].trim().length > 0) {
          addressParts.push(lines[i])
        } else {
          break
        }
      }
      if (addressParts.length > 0) {
        data.ownerAddress = addressParts.join(' ')
      }
    }
  }

  if (!data.encumberedTo) extractSingleField('ENCUMBERED TO', 'encumberedTo')

  // Registration Details
  if (!data.detailsOfFirstRegistration) {
    extractSingleField(
      'DETAILS OF FIRST REGISTRATION',
      'detailsOfFirstRegistration',
    )
  }
  if (!data.remarks) extractSingleField('REMARKS', 'remarks')
  if (!data.orNumber) extractSingleField('O.R. NO.', 'orNumber')
  if (!data.orDate) extractSingleField('O.R. DATE', 'orDate')
  if (!data.amount) extractSingleField('AMOUNT', 'amount')
  if (!data.registrantSignature)
    extractSingleField("REGISTRANT'S SIGNATURE", 'registrantSignature')
  if (!data.by) extractSingleField('BY:', 'by')

  // Chief of Office
  if (!data.chiefOfOffice) {
    const chiefLineIndex = normalizedLines.findIndex((line) =>
      line.includes('CHIEF OF OFFICE'),
    )
    if (chiefLineIndex !== -1) {
      for (
        let i = chiefLineIndex + 1;
        i < Math.min(chiefLineIndex + 3, lines.length);
        i++
      ) {
        const line = lines[i]
        if (
          line &&
          line.length > 3 &&
          !line.toUpperCase().match(/^(SIGNATURE|DATE|BY|NOTE)/)
        ) {
          data.chiefOfOffice = line
          break
        }
      }
    }
  }

  // Note - multi-line
  if (!data.note) {
    const noteIndex = normalizedLines.findIndex((line) => line.includes('NOTE'))
    if (noteIndex !== -1) {
      const noteParts: string[] = []
      for (
        let i = noteIndex + 1;
        i < Math.min(noteIndex + 6, lines.length);
        i++
      ) {
        if (lines[i].trim().length > 0 && !isLabel(lines[i])) {
          noteParts.push(lines[i])
        } else if (isLabel(lines[i])) {
          break
        }
      }
      if (noteParts.length > 0) {
        data.note = noteParts.join(' ')
      }
    }
  }

  // Validate YEAR REBUILT - cannot be the same as YEAR MODEL
  if (data.yearModel && data.yearRebuilt) {
    if (data.yearModel === data.yearRebuilt) {
      // If they're the same, YEAR REBUILT should be N/A
      data.yearRebuilt = 'N/A'
    }
  }

  // Auto-set MAX POWER (KW) to N/A if TYPE OF FUEL is not electric
  if (data.typeOfFuel) {
    const fuelType = data.typeOfFuel.toUpperCase()
    const isElectric = fuelType.includes('ELECTRIC') || fuelType.includes('EV')
    
    // If fuel type is not electric (GAS, PETROL, DIESEL, etc.), always set maxPower to N/A
    if (!isElectric) {
      data.maxPower = 'N/A'
    }
  }

  // Clean up values - remove "N/A" and empty strings
  // But keep maxPower as N/A if fuel type is not electric
  // And keep yearRebuilt as N/A (it's a valid value)
  const shouldKeepMaxPowerAsNA = 
    data.typeOfFuel && 
    !data.typeOfFuel.toUpperCase().includes('ELECTRIC') && 
    !data.typeOfFuel.toUpperCase().includes('EV') &&
    data.maxPower === 'N/A'

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof VehicleRegistration]
    
    // Keep maxPower as N/A for non-electric vehicles
    if (key === 'maxPower' && shouldKeepMaxPowerAsNA) {
      return // Don't delete it
    }
    
    // Keep yearRebuilt as N/A (it's a valid value indicating vehicle wasn't rebuilt)
    if (key === 'yearRebuilt' && value === 'N/A') {
      return // Don't delete it - it's valid N/A
    }
    
    if (
      value === 'N/A' ||
      value === 'n/a' ||
      value === '' ||
      value === undefined
    ) {
      delete data[key as keyof VehicleRegistration]
    }
  })

  return data
}
