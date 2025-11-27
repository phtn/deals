import {DocType} from '../../../convex/documents/d'

export const instructions = {
  cr: `
        [INSTRUCTION]::
        You will be given a block of raw text extracted from a vehicle registration certificate (LTO certificate).
        This text contains keys and values, but:
        - They are not ordered
        - Every key and value appears on its own line
        - Keys and values may be separated by other unrelated lines, or follow loose patterns
        - Some lines may be noise or random text

        Your task is to:
        1. Identify all valid keys related to vehicle registration
        2. Identify all valid values
        3. Match each key to its correct value as accurately as possible based on wording, context, semantic closeness, domain knowledge, and any patterns present in the dataset
        4. Ignore unrelated or noise lines

        Extract the following fields if present:
        - Office Information: fieldOffice, officeCode, dateOfIssue, certificateNumber
          - for certificateNumber: always begin with a number.
        - Vehicle Information: plateNumber, engineNumber, chassisNumber, vin, fileNumber, vehicleType, vehicleCategory, makeBrand, color, typeOfFuel, classification, bodyType, series, yearModel, yearRebuilt, pistonDisplacement, grossWeight, netWeight, maxPower, passengerCapacity
        - Owner Information: ownerName, ownerAddress, encumberedTo
        - Registration Details: detailsOfFirstRegistration, remarks, orNumber, orDate, amount, registrantSignature, by, chiefOfOffice, chiefOfOfficeSignature, note

        Output the final result as a JSON object matching the VehicleRegistration interface.
        Use camelCase for field names (e.g., "plateNumber" not "PLATE NO").
        If multiple values seem to fit a key, choose the one with the highest semantic confidence.
        If no value can reasonably be matched to a key, omit that field (do not include "N/A").
        Only include fields that have valid values.

        IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.
        `,
} as Record<DocType, string>
