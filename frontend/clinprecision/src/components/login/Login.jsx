import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import LoginService from "../../services/LoginService";
import RequestDemoModal from "../common/modals/RequestDemoModal";
import {
    Shield,
    Zap,
    Users,
    BarChart3,
    BarChart2,
    Repeat,
    CheckCircle,
    Globe,
    Clock,
    Award,
    ChevronRight,
    Eye,
    EyeOff,
    FileText,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Send
} from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Use the LoginService to handle authentication
            const result = await LoginService.login(email, password);

            // Extract user data
            const { authData } = result;

            // Store token and userId in localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userId', authData.userId);
            localStorage.setItem('userEmail', authData.userEmail);
            localStorage.setItem('userRole', authData.userRole);

            // Update authentication context with user information
            auth.login(
                email,
                authData.userRole,
                {
                    userId: authData.userId,
                    token: authData.token
                }
            );

            // Navigate to home page after successful login
            navigate("/");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Invalid credentials. Please try again.");
            } else {
                setError("Login failed. Please try again later.");
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoRequest = () => {
        setShowDemoModal(true);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const features = [
        {
            title: "AI-Driven Protocol Deviation Review",
            description: "Leverage advanced AI to automatically detect, flag, and explain protocol deviations—reducing risk and accelerating study timelines.",
            icon: <Zap className="h-6 w-6" />,
        },
        {
            title: "AI-Powered Medical Coding",
            description: "Automate and standardize medical coding with intelligent suggestions, improving accuracy and compliance.",
            icon: <BarChart2 className="h-6 w-6" />,
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "50% Faster Study Setup",
            description: "Streamlined workflows that accelerate your trials"
        },
        {
            title: "Secure & Compliant",
            description: "HIPAA, GDPR, and SOC 2 Type II, FDA 21 CFR Part 11 compliant for peace of mind.",
            icon: <Shield className="h-6 w-6" />,
        },
    ];

    const stats = [
        { number: "0K+", label: "Clinical Trials" },
        { number: "0K+", label: "Patients Enrolled" },
        { number: "99.9%", label: "Uptime SLA" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            {/* Navigation Header */}
            <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CP</span>
                                </div>
                                <h1 className="text-xl font-bold text-white">ClinPrecision</h1>
                            </div>
                            <nav className="hidden md:flex items-center space-x-6">
                                <button
                                    onClick={() => scrollToSection('solutions')}
                                    className="text-white/80 hover:text-white transition-colors focus:outline-none"
                                >
                                    Solutions
                                </button>
                                <button
                                    onClick={() => scrollToSection('resources')}
                                    className="text-white/80 hover:text-white transition-colors focus:outline-none"
                                >
                                    Resources
                                </button>
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-white/80 hover:text-white transition-colors focus:outline-none"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="text-white/80 hover:text-white transition-colors focus:outline-none"
                                >
                                    Contact
                                </button>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleDemoRequest}
                                className="text-white/80 hover:text-white transition-colors focus:outline-none"
                            >
                                Demo
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">

                    {/* Left Column - Marketing Content */}
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30">
                                <Award className="h-4 w-4 text-blue-300 mr-2" />
                                <span className="text-blue-100 text-sm font-medium">Industry Leading EDC Platform</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Accelerate Your
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                                    Clinical Trials
                                </span>
                            </h1>

                            <p className="text-xl text-blue-100 leading-relaxed">
                                The most advanced Electronic Data Capture platform designed for modern clinical research.
                                Streamline your studies, ensure compliance, and bring life-saving treatments to market faster.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                                    <div className="text-blue-200 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 text-blue-300">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                                            <p className="text-blue-200 text-xs mt-1">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center space-x-6 pt-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">SOC 2 Type II</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Globe className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">GDPR Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                    <p className="text-gray-600">Sign in to your ClinPrecision account</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                disabled={loading}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 px-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ?
                                                    <EyeOff className="h-5 w-5 text-gray-400" /> :
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Signing In...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-600">
                                        Need access to ClinPrecision?{" "}
                                        <button
                                            onClick={handleDemoRequest}
                                            className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                                        >
                                            Request Demo
                                        </button>
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>24/7 Support</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <div className="flex items-center space-x-1">
                                        <Shield className="h-3 w-3" />
                                        <span>Secure Login</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Solutions Section */}
            <section id="solutions" className="relative bg-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Complete Clinical Trial Management Solutions
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Streamline every aspect of your clinical research with our comprehensive, AI-powered platform designed for modern clinical trials.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* AI-Driven Protocol Review */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Driven Protocol Review</h3>
                            <p className="text-gray-600 mb-4">
                                Leverage advanced AI to automatically detect, flag, and explain protocol deviations—reducing risk and accelerating study timelines.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Automated deviation detection</li>
                                <li>• Real-time compliance monitoring</li>
                                <li>• Intelligent risk assessment</li>
                                <li>• Regulatory alignment checks</li>
                            </ul>
                        </div>

                        {/* Medical Coding */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                                <BarChart2 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Medical Coding</h3>
                            <p className="text-gray-600 mb-4">
                                Automate and standardize medical coding with intelligent suggestions, improving accuracy and compliance.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• MedDRA and ICD-10 coding</li>
                                <li>• Smart coding suggestions</li>
                                <li>• Quality control automation</li>
                                <li>• Multi-language support</li>
                            </ul>
                        </div>

                        {/* Data Capture */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-100">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Electronic Data Capture</h3>
                            <p className="text-gray-600 mb-4">
                                Intuitive, flexible EDC system with advanced form builder and real-time data validation.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Drag-and-drop form builder</li>
                                <li>• Real-time validation</li>
                                <li>• Mobile-responsive design</li>
                                <li>• Offline data entry</li>
                            </ul>
                        </div>

                        {/* Study Management */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Study Management</h3>
                            <p className="text-gray-600 mb-4">
                                Comprehensive study lifecycle management from protocol design to database lock.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Protocol design tools</li>
                                <li>• Site management</li>
                                <li>• Patient enrollment tracking</li>
                                <li>• Milestone monitoring</li>
                            </ul>
                        </div>

                        {/* Compliance & Security */}
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-8 border border-red-100">
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Compliance & Security</h3>
                            <p className="text-gray-600 mb-4">
                                Enterprise-grade security with full regulatory compliance for global clinical trials.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• 21 CFR Part 11 compliant</li>
                                <li>• HIPAA & GDPR ready</li>
                                <li>• SOC 2 Type II certified</li>
                                <li>• Audit trail & e-signatures</li>
                            </ul>
                        </div>

                        {/* Analytics & Reporting */}
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-8 border border-cyan-100">
                            <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Reporting</h3>
                            <p className="text-gray-600 mb-4">
                                Advanced analytics and customizable reporting for data-driven decision making.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Real-time dashboards</li>
                                <li>• Custom report builder</li>
                                <li>• Data visualization</li>
                                <li>• Export capabilities</li>
                            </ul>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center mt-16">
                        <button
                            onClick={handleDemoRequest}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Schedule a Demo
                        </button>
                        <p className="text-gray-600 mt-4">
                            See how ClinPrecision can accelerate your clinical trials
                        </p>
                    </div>
                </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="relative bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Resources & Knowledge Center
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Access our comprehensive library of resources to help you succeed in clinical research.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Whitepapers */}
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Whitepapers</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                In-depth insights on clinical trial best practices, regulatory updates, and industry trends.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• AI in Clinical Trials: The Future is Now</li>
                                <li>• Regulatory Compliance Guide 2025</li>
                                <li>• Data Quality Best Practices</li>
                                <li>• Protocol Optimization Strategies</li>
                            </ul>
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                View All Whitepapers →
                            </button>
                        </div>

                        {/* Case Studies */}
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Studies</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Real-world success stories from pharmaceutical companies using ClinPrecision.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• 40% Faster Study Setup - Phase III</li>
                                <li>• 60% Reduction in Protocol Deviations</li>
                                <li>• Multi-Site Oncology Trial Success</li>
                                <li>• Rare Disease Study Acceleration</li>
                            </ul>
                            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                                Read Case Studies →
                            </button>
                        </div>

                        {/* Documentation */}
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentation</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Comprehensive guides, API documentation, and training materials.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• User Guides & Tutorials</li>
                                <li>• API Documentation</li>
                                <li>• Video Training Library</li>
                                <li>• System Requirements</li>
                            </ul>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                Access Documentation →
                            </button>
                        </div>

                        {/* Webinars & Events */}
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Webinars & Events</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Join our educational webinars and industry events to stay ahead.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Weekly Product Demos</li>
                                <li>• Monthly Expert Webinars</li>
                                <li>• Industry Conference Presence</li>
                                <li>• Customer Success Sessions</li>
                            </ul>
                            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                                View Events →
                            </button>
                        </div>
                    </div>

                    {/* Featured Resource */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mt-12 text-white">
                        <div className="max-w-4xl mx-auto text-center">
                            <h3 className="text-2xl font-bold mb-4">
                                🎯 Featured Resource: "The Complete Guide to AI-Driven Clinical Trials"
                            </h3>
                            <p className="text-blue-100 mb-6 text-lg">
                                Download our comprehensive 50-page guide covering everything from AI implementation to regulatory considerations in modern clinical research.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors">
                                    Download Free Guide
                                </button>
                                <button
                                    onClick={handleDemoRequest}
                                    className="border border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Schedule Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative bg-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Company Story */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Revolutionizing Clinical Research Through Innovation
                            </h2>
                            <div className="space-y-6 text-gray-600">
                                <p className="text-lg">
                                    At ClinPrecision, we believe that groundbreaking medical discoveries shouldn't be held back by outdated technology. Founded by clinical research veterans and technology experts, we're on a mission to accelerate the development of life-saving treatments.
                                </p>
                                <p>
                                    Our platform combines cutting-edge AI technology with deep clinical research expertise to create solutions that truly understand the complexities of modern clinical trials. We're not just building software—we're building the future of clinical research.
                                </p>
                                <p>
                                    Since our founding, we've helped pharmaceutical companies, biotech firms, and research institutions around the world conduct more efficient, compliant, and successful clinical trials.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">500+</div>
                                    <div className="text-gray-600">Clinical Trials Managed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">50,000+</div>
                                    <div className="text-gray-600">Patients Enrolled</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">99.9%</div>
                                    <div className="text-gray-600">Platform Uptime</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">24/7</div>
                                    <div className="text-gray-600">Expert Support</div>
                                </div>
                            </div>
                        </div>

                        {/* Values & Mission */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Award className="h-6 w-6 text-blue-600 mr-3" />
                                    Our Mission
                                </h3>
                                <p className="text-gray-600">
                                    To democratize access to cutting-edge clinical trial technology, making it possible for organizations of all sizes to conduct world-class research that brings life-changing treatments to patients faster.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                    Our Values
                                </h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• <strong>Patient-First:</strong> Every decision considers patient safety and outcomes</li>
                                    <li>• <strong>Innovation:</strong> Continuous advancement in technology and methodology</li>
                                    <li>• <strong>Compliance:</strong> Unwavering commitment to regulatory standards</li>
                                    <li>• <strong>Partnership:</strong> True collaboration with our clients' success</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Globe className="h-6 w-6 text-purple-600 mr-3" />
                                    Global Reach
                                </h3>
                                <p className="text-gray-600">
                                    Trusted by leading pharmaceutical companies across North America, Europe, and Asia-Pacific. Our platform supports trials in 40+ countries with local regulatory compliance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Leadership Team */}
                    <div className="mt-20">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Leadership Team</h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Our team combines decades of clinical research experience with cutting-edge technology expertise.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-xl font-bold">NS</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Narendra Sarkar</h4>
                                <p className="text-blue-600 font-medium">Co-Founder & CEO</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    12+ years in clinical research, former Head of Portfolio Lead Architecture at leading CRO
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-xl font-bold">MS</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Mahua Sarkar</h4>
                                <p className="text-green-600 font-medium">Co-Founder & COO</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Clinical operations expert with global trial management experience
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-xl font-bold">AI</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">AI Research Team</h4>
                                <p className="text-purple-600 font-medium">Technology Division</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    PhD researchers from top universities, specialists in medical AI
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Clinical Trials?</h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join hundreds of research organizations that trust ClinPrecision to accelerate their clinical research.
                        </p>
                        <button
                            onClick={handleDemoRequest}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Start Your Journey
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Ready to accelerate your clinical trials? Our team is here to help you get started.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Let's Start a Conversation</h3>
                                <p className="text-gray-600 mb-8">
                                    Whether you're planning your first clinical trial or looking to optimize existing processes,
                                    we're here to provide expert guidance and support.
                                </p>
                            </div>

                            {/* Contact Methods */}
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Email Us</h4>
                                        <p className="text-gray-600">
                                            <a href="mailto:hello@clinprecision.com" className="text-blue-600 hover:text-blue-700">
                                                hello@clinprecision.com
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                        <Phone className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Call Us</h4>
                                        <p className="text-gray-600">
                                            <a href="tel:+1-555-CLINPRECISION" className="text-green-600 hover:text-green-700">
                                                +1 (555) CLIN-PRECISION
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                        <MapPin className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Visit Us</h4>
                                        <p className="text-gray-600">
                                            Cgicago, IL<br />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Demo Button */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                                <h4 className="text-lg font-semibold mb-3">Want to See ClinPrecision in Action?</h4>
                                <p className="text-blue-100 mb-4">
                                    Schedule a personalized demo with our team and see how we can transform your clinical trials.
                                </p>
                                <button
                                    onClick={handleDemoRequest}
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center"
                                >
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Schedule Demo
                                </button>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Your first name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Your last name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your.email@company.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your company name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How can we help you?
                                    </label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                        <option value="">Select an option</option>
                                        <option value="demo">Schedule a Demo</option>
                                        <option value="pricing">Get Pricing Information</option>
                                        <option value="implementation">Implementation Support</option>
                                        <option value="partnership">Partnership Opportunities</option>
                                        <option value="support">Technical Support</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about your clinical trial needs..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                                >
                                    <Send className="h-5 w-5 mr-2" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 mt-16 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CP</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">ClinPrecision</span>
                            </div>
                            <div className="text-gray-600 text-sm">
                                © 2024 ClinPrecision. All rights reserved. | Privacy Policy | Terms of Service
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Request Demo Modal */}
            <RequestDemoModal
                isOpen={showDemoModal}
                onClose={() => setShowDemoModal(false)}
            />
        </div>
    );
}
