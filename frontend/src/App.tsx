
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Mail, RefreshCw } from "lucide-react"
import { ScrollArea } from '@radix-ui/react-scroll-area'
import axios from 'axios'

export default function App() {
  const [email, setEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<string>('')

  const stats = {
    totalVerified: 10000,
    validEmails: 8500,
    invalidEmails: 1500,
    verificationRate: 85
  }

  const recentVerifications = [
    { email: 'john@example.com', status: 'valid', date: '2023-04-01' },
    { email: 'jane@example.com', status: 'invalid', date: '2023-04-01' },
    { email: 'bob@example.com', status: 'valid', date: '2023-03-31' },
    { email: 'alice@example.com', status: 'valid', date: '2023-03-31' },
    { email: 'charlie@example.com', status: 'invalid', date: '2023-03-30' },
  ]

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsVerifying(true)
    
    const result=axios.get("http://localhost:8080/verify", {params: {
      email: email
    }})
    const answer=(await result).data.result.valid
    console.log((await result).data)
    if(answer===true){

      setVerificationResult("valid")  
      setIsVerifying(false)  
    }
    else{
      setVerificationResult("invalid")    
      setIsVerifying(false)
    }
    setInterval(() => {
      setIsVerifying(false)  
    }, 1500);
  }

  return (
    <div className=" w-1/2 mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Email Verification Dashboard</h1>
      
      <div className=" w-full grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVerified.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Emails</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validEmails.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Emails</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invalidEmails.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verificationRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verify New Email</CardTitle>
          <CardDescription>Enter an email address to verify its validity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </CardContent>
        {verificationResult && (
          <CardFooter>
            <div className={`flex items-center space-x-2 ${verificationResult === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
              {verificationResult === 'valid' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>Email is {verificationResult}</span>
            </div>
          </CardFooter>
        )}
      </Card>
      <ScrollArea className="h-56 w-full rounded-md border">
      <Card className="h-56 w-full overflow-y-scroll ">
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>A list of recent email verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVerifications.map((verification, index) => (
                <TableRow key={index}>
                  <TableCell>{verification.email}</TableCell>
                  <TableCell>
                    <Badge variant={verification.status === 'valid' ? 'default' : 'destructive'}>
                      {verification.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{verification.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </ScrollArea>

    </div>
  )
}