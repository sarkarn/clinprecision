import React, { useState } from "react";
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

interface Feature {
    title: string;
    description: string;
    icon: React.ReactElement;
}

interface Stat {
    number: string;
    label: string;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Use the LoginService to handle authentication
            const result = await LoginService.login({ email, password }) as any;

            // Extract user data
            const { authData } = result;

            // Store token and userId in localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userId', authData.userId);
            localStorage.setItem('userNumericId', authData.userNumericId);
            localStorage.setItem('userEmail', authData.userEmail);
            localStorage.setItem('userRole', authData.userRole);
            localStorage.setItem('userName', authData.userName);

            // Update authentication context with user information
            auth.login(
                email,
                authData.userRole,
                {
                    userId: authData.userId,
                    userNumericId: authData.userNumericId,
                    token: authData.token,
                    name: authData.userName
                }
            );

            // Navigate to home page after successful login
            navigate("/");
        } catch (err: any) {
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

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const features: Feature[] = [
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

    const stats: Stat[] = [
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
            <section id="solutions" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Comprehensive EDC Solutions
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to run successful clinical trials, all in one platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* AI-Driven Review */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                AI-Driven Protocol Review
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Leverage advanced AI to automatically detect and flag protocol deviations
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Automatic deviation detection</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Risk assessment and prioritization</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Real-time compliance monitoring</span>
                                </li>
                            </ul>
                        </div>

                        {/* Medical Coding */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                AI-Powered Medical Coding
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Automate and standardize medical coding with intelligent suggestions
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>MedDRA and WHODrug support</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Smart coding suggestions</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Improved accuracy and consistency</span>
                                </li>
                            </ul>
                        </div>

                        {/* EDC Platform */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Repeat className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Electronic Data Capture
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Intuitive EDC system designed for modern clinical trials
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Drag-and-drop form builder</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Real-time data validation</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Offline data entry support</span>
                                </li>
                            </ul>
                        </div>

                        {/* Study Management */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Study Management
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Comprehensive tools for managing multi-site clinical trials
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Site and subject management</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Visit scheduling and tracking</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Role-based access control</span>
                                </li>
                            </ul>
                        </div>

                        {/* Compliance */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Compliance & Security
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Enterprise-grade security and regulatory compliance
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>FDA 21 CFR Part 11 compliant</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Complete audit trail</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>End-to-end encryption</span>
                                </li>
                            </ul>
                        </div>

                        {/* Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="h-6 w-6 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Analytics & Reporting
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Powerful analytics to drive data-driven decisions
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Real-time dashboards</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Custom report builder</span>
                                </li>
                                <li className="flex items-start space-x-2 text-gray-600">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Data export in multiple formats</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Resources & Knowledge
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Learn how to optimize your clinical trials with our expert resources
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                            <FileText className="h-10 w-10 text-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Whitepapers</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                In-depth research and industry insights
                            </p>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                                Explore <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                            <Users className="h-10 w-10 text-purple-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Studies</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Real-world success stories from our clients
                            </p>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                                Read More <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                            <FileText className="h-10 w-10 text-green-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Comprehensive guides and API references
                            </p>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                                View Docs <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                            <Calendar className="h-10 w-10 text-orange-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Webinars</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Live sessions with industry experts
                            </p>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                                Register <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            About ClinPrecision
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Pioneering the future of clinical research technology
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                            <p className="text-gray-600 mb-4">
                                Founded by clinical research veterans, ClinPrecision was born from the frustration
                                with outdated, cumbersome EDC systems that slowed down critical medical research.
                            </p>
                            <p className="text-gray-600 mb-4">
                                We built ClinPrecision from the ground up to be the platform we always wished we had—
                                intuitive, powerful, and designed specifically for the needs of modern clinical trials.
                            </p>
                            <p className="text-gray-600">
                                Today, we serve hundreds of research organizations worldwide, helping them bring
                                life-saving treatments to market faster while maintaining the highest standards
                                of data quality and regulatory compliance.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <div className="text-3xl font-bold text-blue-600 mb-2">0K+</div>
                                <div className="text-gray-700 font-medium">Trials Managed</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6">
                                <div className="text-3xl font-bold text-purple-600 mb-2">0K+</div>
                                <div className="text-gray-700 font-medium">Patients Enrolled</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-6">
                                <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                                <div className="text-gray-700 font-medium">System Uptime</div>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-6">
                                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                                <div className="text-gray-700 font-medium">Expert Support</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Mission</h3>
                            <p className="text-gray-600">
                                To accelerate medical breakthroughs by providing researchers with the
                                most advanced and user-friendly clinical trial management platform.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Values</h3>
                            <p className="text-gray-600">
                                Innovation, integrity, and patient-centricity guide everything we do.
                                We believe in building technology that makes a real difference.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Reach</h3>
                            <p className="text-gray-600">
                                Serving research organizations across 50+ countries with multilingual
                                support and localized compliance features.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Leadership Team</h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4"></div>
                                <h4 className="font-semibold text-gray-900">Dr. Sarah Chen</h4>
                                <p className="text-gray-600 text-sm">CEO & Co-Founder</p>
                                <p className="text-gray-500 text-xs mt-2">Former Clinical Research Director</p>
                            </div>
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4"></div>
                                <h4 className="font-semibold text-gray-900">Michael Rodriguez</h4>
                                <p className="text-gray-600 text-sm">CTO & Co-Founder</p>
                                <p className="text-gray-500 text-xs mt-2">20+ Years in Healthcare IT</p>
                            </div>
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4"></div>
                                <h4 className="font-semibold text-gray-900">Dr. Emily Watson</h4>
                                <p className="text-gray-600 text-sm">Chief Medical Officer</p>
                                <p className="text-gray-500 text-xs mt-2">Board-Certified Physician</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Get In Touch
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Have questions? We're here to help you get started
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="john.doe@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tell us about your needs..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Send className="h-5 w-5" />
                                    <span>Send Message</span>
                                </button>
                            </form>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Email</div>
                                            <div className="text-gray-600">info@clinprecision.com</div>
                                            <div className="text-gray-600">support@clinprecision.com</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Phone</div>
                                            <div className="text-gray-600">+1 (555) 123-4567</div>
                                            <div className="text-gray-600">24/7 Support Available</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Office</div>
                                            <div className="text-gray-600">123 Innovation Drive</div>
                                            <div className="text-gray-600">San Francisco, CA 94105</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-6">
                                <h4 className="font-semibold text-gray-900 mb-2">Request a Demo</h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    See ClinPrecision in action. Schedule a personalized demo with our team.
                                </p>
                                <button
                                    onClick={handleDemoRequest}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Schedule Demo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-gray-600 text-sm">
                                © 2024 ClinPrecision. All rights reserved.
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                                <a href="#" className="hover:text-blue-600 transition-colors">Cookie Settings</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Request Demo Modal */}
            {/* @ts-ignore */}
            <RequestDemoModal
                isOpen={showDemoModal}
                onClose={() => setShowDemoModal(false)}
            />
        </div>
    );
};

export default Login;
