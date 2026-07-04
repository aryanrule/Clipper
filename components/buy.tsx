import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BuyProp {
  open : boolean , 
  onOpenChange : (open : boolean) => void
}

const Buy = ({open , onOpenChange} : BuyProp) => {
  return (
    
    <Dialog open = {open}  onOpenChange={onOpenChange}>
   <DialogContent>
  <DialogHeader>
    <DialogTitle>You've reached your free clip limit 🎉</DialogTitle>
    <DialogDescription>
      Servers and AI processing don't come cheap. Your free plan includes
      <span className="font-semibold"> 2 clips</span> to help you try the
      platform. Upgrade to continue generating unlimited clips, faster
      processing, and support the ongoing development of Clipper.
    </DialogDescription>
  </DialogHeader>
</DialogContent>
    
    </Dialog>
  )
}

export default Buy