"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Shipment } from "@/lib/types"
import { parseExcelFile } from "@/lib/excel-parser"

interface ExcelUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (shipments: Shipment[]) => void
}

interface UploadState {
  status: "idle" | "uploading" | "parsing" | "success" | "error"
  progress: number
  message: string
  parsedData?: Shipment[]
  errors?: string[]
}

export function ExcelUploadModal({ isOpen, onClose, onUploadComplete }: ExcelUploadModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    message: "",
  })
  const [dragActive, setDragActive] = useState(false)

  const resetState = () => {
    setUploadState({
      status: "idle",
      progress: 0,
      message: "",
    })
  }

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "Please upload a valid Excel file (.xlsx or .xls)",
      })
      return
    }

    setUploadState({
      status: "uploading",
      progress: 25,
      message: "Uploading file...",
    })

    try {
      // Simulate upload progress
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUploadState({
        status: "parsing",
        progress: 50,
        message: "Parsing Excel data...",
      })

      const result = await parseExcelFile(file)

      if (result.success && result.data) {
        setUploadState({
          status: "success",
          progress: 100,
          message: `Successfully parsed ${result.data.length} shipments`,
          parsedData: result.data,
        })
      } else {
        setUploadState({
          status: "error",
          progress: 0,
          message: "Failed to parse Excel file",
          errors: result.errors,
        })
      }
    } catch (error) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "An error occurred while processing the file",
      })
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (uploadState.parsedData) {
      onUploadComplete(uploadState.parsedData)
      onClose()
      resetState()
    }
  }

  const handleClose = () => {
    onClose()
    resetState()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Shipments from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) with shipment data. The file should contain columns for Shipment ID,
            Order ID, Item ID, SKU ID, Reason, Aging, Receiving Date, Photos Received, and Status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {uploadState.status === "idle" && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your Excel file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* Progress */}
          {(uploadState.status === "uploading" || uploadState.status === "parsing") && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-medium">{uploadState.message}</span>
              </div>
              <Progress value={uploadState.progress} className="w-full" />
            </div>
          )}

          {/* Success */}
          {uploadState.status === "success" && uploadState.parsedData && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.message}</AlertDescription>
              </Alert>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Preview of imported data:</h4>
                <div className="space-y-2">
                  {uploadState.parsedData.slice(0, 3).map((shipment, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">{shipment.shipmentId}</Badge>
                      <span>{shipment.orderId}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{shipment.status}</span>
                    </div>
                  ))}
                  {uploadState.parsedData.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      ...and {uploadState.parsedData.length - 3} more shipments
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {uploadState.status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.message}</AlertDescription>
              </Alert>

              {uploadState.errors && uploadState.errors.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h4 className="font-medium text-destructive">Errors found:</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-destructive">
                    {uploadState.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="outline" onClick={resetState} className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}

          {/* Sample Template */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Expected Excel Format:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Your Excel file should have the following columns:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <span>• Shipment Id</span>
                <span>• Order Id</span>
                <span>• Item ID</span>
                <span>• SKU ID</span>
                <span>• Reason</span>
                <span>• Aging</span>
                <span>• Receiving Date</span>
                <span>• Photos Received</span>
                <span>• Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {uploadState.status === "success" && (
            <Button onClick={handleImport}>Import {uploadState.parsedData?.length} Shipments</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
