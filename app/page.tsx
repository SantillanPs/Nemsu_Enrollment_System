import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  ArrowRight,
  Check,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">Prestige University</span>
            </div>

            <nav className="hidden md:flex gap-6 items-center">
              <Link
                href="#programs"
                className="hover:underline transition duration-200 hover:text-blue-200"
              >
                Programs
              </Link>
              <Link
                href="#admissions"
                className="hover:underline transition duration-200 hover:text-blue-200"
              >
                Admissions
              </Link>
              <Link
                href="#campus"
                className="hover:underline transition duration-200 hover:text-blue-200"
              >
                Campus Life
              </Link>
              <Link
                href="#research"
                className="hover:underline transition duration-200 hover:text-blue-200"
              >
                Research
              </Link>
              <Link
                href="#about"
                className="hover:underline transition duration-200 hover:text-blue-200"
              >
                About Us
              </Link>
            </nav>

            <div className="flex gap-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="text-blue-800 border-white hover:bg-white/10 hover:text-white transition-colors duration-200"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-blue-800 hover:bg-gray-100 transition-colors duration-200 shadow-md hover:shadow-lg">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section with Video Background */}
        <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/university-campus.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                Shape Your Future with Excellence
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8 animate-fade-in delay-100">
                Join our prestigious university and embark on a journey of
                academic excellence, innovation, and personal growth.
              </p>
              <div className="flex flex-wrap gap-4 justify-center animate-fade-in delay-200">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-blue-800 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Apply Now
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-blue-800 border-white hover:bg-white/20 hover:text-white transition-colors duration-300"
                >
                  Explore Programs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section with Animation */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "15,000+", label: "Students" },
                { value: "500+", label: "Faculty Members" },
                { value: "200+", label: "Programs" },
                { value: "95%", label: "Employment Rate" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <p className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="programs" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Academic Programs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover a wide range of undergraduate and graduate programs
                designed to prepare you for success in today's competitive
                world.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Business Administration",
                  description:
                    "Develop leadership skills and business acumen for the modern corporate world with our AACSB-accredited program.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
                {
                  title: "Computer Science",
                  description:
                    "Learn cutting-edge technologies and programming skills for the digital age with hands-on projects and industry partnerships.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
                {
                  title: "Engineering",
                  description:
                    "Solve complex problems and design innovative solutions through our ABET-accredited engineering programs.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
                {
                  title: "Medicine & Health Sciences",
                  description:
                    "Prepare for a rewarding career in healthcare with state-of-the-art facilities and clinical rotations.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
                {
                  title: "Arts & Humanities",
                  description:
                    "Explore human culture, history, and creativity through diverse perspectives and interdisciplinary approaches.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
                {
                  title: "Social Sciences",
                  description:
                    "Understand human behavior and social structures to address global challenges through research and fieldwork.",
                  icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                  color: "bg-blue-50",
                },
              ].map((program, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300 border-0 overflow-hidden group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`${program.color} p-6`}>{program.icon}</div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <Link
                      href="#"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      Learn more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View All Programs
              </Button>
            </div>
          </div>
        </section>

        {/* Admissions Section */}
        <section id="admissions" className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Admissions Process
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join our community of scholars and innovators. Applications are
                now open for the upcoming academic year.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-700" />
                      <CardTitle>Key Dates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {[
                        {
                          label: "Early Application Deadline",
                          date: "November 15, 2024",
                        },
                        {
                          label: "Regular Application Deadline",
                          date: "January 15, 2025",
                        },
                        {
                          label: "Decision Notification",
                          date: "March 31, 2025",
                        },
                        {
                          label: "Enrollment Confirmation",
                          date: "May 1, 2025",
                        },
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {item.date}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-700" />
                      <CardTitle>Admission Requirements</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        "Completed application form",
                        "Official high school transcripts",
                        "Standardized test scores (SAT/ACT)",
                        "Letters of recommendation",
                        "Personal statement/essay",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Ready to Apply?</h3>
                    <p className="text-gray-600">
                      Take the first step towards your future by creating an
                      account and starting your application today.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Link href="/signup" className="w-full block">
                      <Button className="w-full" size="lg">
                        Start New Application
                      </Button>
                    </Link>
                    <Link href="/login" className="w-full block">
                      <Button variant="outline" className="w-full" size="lg">
                        Continue Application
                      </Button>
                    </Link>
                    <div className="text-center mt-4">
                      <Link
                        href="#"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        Learn more about the application process{" "}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from our students about their experiences at Prestige
                University.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "The faculty at Prestige University are truly exceptional. They've challenged me to think critically and supported me every step of the way.",
                  name: "Sarah Johnson",
                  role: "Computer Science, Class of 2023",
                },
                {
                  quote:
                    "The research opportunities here are unmatched. I've been able to work on cutting-edge projects as an undergraduate.",
                  name: "Michael Chen",
                  role: "Engineering, Class of 2024",
                },
                {
                  quote:
                    "The campus community is so welcoming. I've made lifelong friends and connections that will help me throughout my career.",
                  name: "Emma Rodriguez",
                  role: "Business Administration, Class of 2025",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-600 italic mb-6">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-gray-500 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Begin Your Academic Journey Today
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of students who have transformed their lives
              through our world-class education programs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-800 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-blue-800 border-white hover:bg-white/20 hover:text-white transition-colors duration-300"
              >
                Schedule Campus Tour
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" />
                <span className="text-lg font-bold">Prestige University</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering minds and transforming lives through education since
                1965.
              </p>
              <div className="flex gap-4">
                {[
                  "facebook",
                  "twitter",
                  "instagram",
                  "linkedin",
                  "youtube",
                ].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* Social media icons would be here */}
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  "Programs",
                  "Admissions",
                  "Campus Life",
                  "Research",
                  "About Us",
                ].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {[
                  "Library",
                  "Career Services",
                  "Academic Calendar",
                  "Student Portal",
                  "Alumni Network",
                ].map((resource) => (
                  <li key={resource}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {resource}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="text-gray-400 not-italic space-y-2">
                <p>123 University Avenue</p>
                <p>City, State 12345</p>
                <p>Email: info@prestige.edu</p>
                <p>Phone: (123) 456-7890</p>
                <p>Fax: (123) 456-7891</p>
              </address>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Prestige University. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
