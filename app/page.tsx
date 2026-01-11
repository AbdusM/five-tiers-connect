import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="text-2xl font-black italic tracking-tighter text-indigo-600">WE UP</span>
          <Link href="/auth/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wide">
            <Shield className="w-4 h-4" />
            Rapid Deployable PRM
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-none">
            STAY ON<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">YOUR FEET.</span>
          </h1>

          <p className="text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Be consistent. Be reliable.
            <br />
            The tool for managing your team, your goals, and your comeback.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-gray-900 hover:bg-gray-800 shadow-xl transition-transform hover:scale-105">
                Launch Dashboard <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Goal Engine</h3>
            <p className="text-gray-500">Track your wins. From getting your ID to landing that job. Visualize your progress.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">My Team</h3>
            <p className="text-gray-500">Manage your squad. Keep your lifelines close and your network growing.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Rapid Deployable</h3>
            <p className="text-gray-500">No complex setup. No barriers. Just instant access to the tools you need.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
