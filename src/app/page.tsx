'use client'

import { Decoder, Encoder, Profile, Stream } from '@garmin/fitsdk'
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const roundToThreeDecimalPlaces = (value: number): number => {
    return Math.round(value * 1000) / 1000
  }

  const roundToTwoDecimalPlaces = (value: number): number => {
    return Math.round(value * 100) / 100
  }

  const getMesgNumKey = (key: string): string => {
    return key
      .replace(/Mesgs$/, '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase()
  }

  const handleUpdate = async () => {
    if (!file) {
      alert('Please upload a FIT file.')
      return
    }

    const reader = new FileReader()
    reader.onload = function (e) {
      try {
        const arrayBuffer = e.target?.result
        if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
          const stream = new Stream(arrayBuffer)
          const decoder = new Decoder(stream)

          if (!decoder.isFIT()) {
            alert('The file is not a valid FIT file.')
            return
          }

          if (!decoder.checkIntegrity()) {
            alert('The FIT file is corrupted.')
            return
          }

          const { messages } = decoder.read()

          let lastTimestamp: number | null = null
          let totalDistance = 0
          let maxSpeed = 0

          const recordMessages = messages.recordMesgs
          recordMessages.forEach((message) => {
            // Caclulate speed based on power.
            const power: number = message.power
            let speed: number
            if (power <= 20) {
              speed = power * 0.19
            } else if (power <= 50) {
              speed = power * 0.13
            } else if (power <= 100) {
              speed = power * 0.085
            } else if (power <= 180) {
              speed = power * 0.0614
            } else if (power <= 250) {
              speed = power * 0.0429
            } else {
              speed = power * 0.0359
            }

            speed = roundToThreeDecimalPlaces(speed)
            message.speed = speed

            if (speed > maxSpeed) {
              maxSpeed = speed
            }

            // Calculate distance based on speed.
            const timestamp = new Date(message.timestamp).getTime() / 1000
            let deltaTime = 1
            if (lastTimestamp !== null) {
              deltaTime = timestamp - lastTimestamp
            }
            lastTimestamp = timestamp

            totalDistance += speed * deltaTime
            message.distance = roundToTwoDecimalPlaces(totalDistance)
          })

          const lapMessage = messages.lapMesgs?.[0]
          if (lapMessage) {
            lapMessage.totalDistance = roundToTwoDecimalPlaces(totalDistance)

            const totalElapsedTime = lapMessage.totalElapsedTime
            lapMessage.avgSpeed = roundToTwoDecimalPlaces(totalDistance / totalElapsedTime)
            lapMessage.maxSpeed = roundToTwoDecimalPlaces(maxSpeed)
          }

          const sessionMessage = messages.sessionMesgs?.[0]
          if (sessionMessage) {
            sessionMessage.totalDistance = roundToTwoDecimalPlaces(totalDistance)

            const totalElapsedTime = sessionMessage.totalElapsedTime
            sessionMessage.avgSpeed = roundToTwoDecimalPlaces(totalDistance / totalElapsedTime)
            lapMessage.maxSpeed = roundToTwoDecimalPlaces(maxSpeed)
          }

          const encoder = new Encoder()
          Object.keys(messages).forEach((key) => {
            const mesgNumKey = getMesgNumKey(key)
            const mesgNum: number = Profile.MesgNum[mesgNumKey]

            // Session
            if (mesgNum == 18) {
              encoder.onMesg(mesgNum, sessionMessage)
              return
            }

            // Lap
            if (mesgNum == 19) {
              encoder.onMesg(mesgNum, lapMessage)
              return
            }

            // Record
            if (mesgNum == 20) {
              recordMessages.forEach((message) => {
                encoder.onMesg(mesgNum, message)
              })
              return
            }

            const keyMessages = messages[key] ?? []
            keyMessages.forEach((message) => {
              if (!message || Object.keys(message).length === 0) {
                return
              }

              encoder.onMesg(mesgNum, message)
            })
            return
          })

          const uint8Array = encoder.close()
          const blob = new Blob([uint8Array], {
            type: 'application/octet-stream'
          })

          const originalName = file.name.replace(/\.fit$/i, '')
          const editedName = `${originalName}-edited.fit`

          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = editedName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error(error)
        alert('An unexpected error occurred. Please try again.')
        return
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-sm min-w-[500px]">
        <h1 className="text-2xl font-bold">FIT Distance</h1>
        <p className="text-gray-600 mb-4">
          Calculate speed and distance ±5% using power information. Based on data from a Stages SC3 bike.
        </p>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-900">
          Upload FIT file
        </label>
        <div className="mt-2">
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <input
              id="file-upload"
              type="file"
              accept=".fit"
              onChange={handleFileChange}
              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          className="mt-6 cursor-pointer w-full py-2.5 bg-black text-white font-semibold text-sm rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
        >
          Update
        </button>
      </div>
    </div>
  )
}
