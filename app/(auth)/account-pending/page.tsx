import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Clock, CheckCircle, ArrowLeft } from "lucide-react"

export default function AccountPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="flex justify-center mt-5">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">Application Pending</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Your application is being processed</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-center">Application Under Review</CardTitle>
            <CardDescription className="text-center">Thank you for submitting your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Your application has been received and is currently under review by our admissions team. This process
                typically takes 3-5 business days.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Next steps:</h3>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-500">Your application has been successfully submitted</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Under Review</p>
                  <p className="text-sm text-gray-500">Our admissions team is reviewing your application</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Decision</p>
                  <p className="text-sm text-gray-500">You will be notified of the admissions decision</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Enrollment</p>
                  <p className="text-sm text-gray-500">Complete enrollment if accepted</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-center text-gray-600">
              We will send you an email notification once your application has been processed. You can also check your
              application status by logging in to your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Check Status
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button className="w-full">Return to Home</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
