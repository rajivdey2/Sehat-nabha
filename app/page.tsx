"use client"
import { CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AvatarFallback } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Stethoscope,
  Users,
  Video,
  Clipboard,
  FileText,
  CalendarIcon,
  BarChart3,
  AlertTriangle,
  Clock,
  WifiOff,
  Plus,
  Edit,
  Phone,
  Download,
  Pill,
  Settings,
  Eye,
  Mic,
  Volume2,
  Heart,
  User,
  Brain,
  Activity,
  Calendar,
  LogOut,
} from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { OfflineIndicator } from "@/components/offline-indicator"
import { offlineDB } from "@/lib/offline-db"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Medicine {
  id: string
  name: string
  genericName: string
  manufacturer: string
  batchNumber: string
  expiryDate: string
  quantity: number
  minStockLevel: number
  price: number
  category: "tablet" | "syrup" | "injection" | "capsule" | "ointment"
  prescription: boolean
}

interface PrescriptionOrder {
  id: string
  patientName: string
  doctorName: string
  medicines: Array<{
    medicineId: string
    medicineName: string
    quantity: number
    dosage: string
    instructions: string
  }>
  status: "pending" | "processing" | "ready" | "dispensed"
  orderDate: string
  priority: "normal" | "urgent"
}

interface Prescription {
  id?: string
  patientId: string
  doctorId: string
  medicines: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  diagnosis: string
  notes: string
  date: string
}

interface AppUser {
  id: string
  name: string
  phone: string
  role: "patient" | "doctor" | "pharmacist" | "admin"
  language: "en" | "hi" | "pa"
}

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  symptoms: string
  appointmentTime: string
  status: "waiting" | "in-consultation" | "completed"
  priority: "low" | "medium" | "high"
}

type Language = "en" | "hi" | "pa"
type UserRole = "patient" | "doctor" | "pharmacist" | "admin"

const translations = {
  en: {
    appName: "Sehat Nabha",
    onlineMode: "Online",
    offlineMode: "Offline",
    selectLanguage: "Select Language",
    enterPhone: "Enter Phone Number",
    enterOtp: "Enter OTP",
    selectRole: "Select Your Role",
    patient: "Patient",
    doctor: "Doctor",
    pharmacist: "Pharmacist",
    admin: "Admin",
    dashboard: "Dashboard",
    profile: "Profile",
    healthRecords: "Health Records",
    telemedicine: "Telemedicine",
    medicines: "Medicines",
    symptoms: "Symptoms",
    emergency: "Emergency",
    bookConsultation: "Book Consultation",
    findMedicine: "Find Medicine",
    checkSymptoms: "Check Symptoms",
    callAmbulance: "Call Ambulance",
    accessibility: "Accessibility",
    fontSize: "Font Size",
    highContrast: "High Contrast",
    voiceInput: "Voice Input",
    screenReader: "Screen Reader Mode",
    phoneVerification: "Phone Verification",
    enterPhoneNumber: "Enter your phone number to receive an OTP",
    phoneNumber: "Phone Number",
    sendOTP: "Send OTP",
    back: "Back",
    verifyOTP: "Verify OTP",
    otpSentTo: "OTP sent to",
    enterOTP: "Enter OTP",
    chooseYourRole: "Choose your role to continue",
    continue: "Continue",
    patientDescription: "Book appointments, view health records",
    doctorDescription: "Manage patients, prescribe medicines",
    pharmacistDescription: "Manage inventory, process prescriptions",
    adminDescription: "Manage users, system settings",
    welcome: "Welcome",
    connectWithDoctor: "Book a virtual consultation with a doctor",
    aiSymptomChecker: "Check your symptoms with our AI assistant",
    healthSummary: "Your Health Summary",
    recentActivity: "Recent Activity",
    viewFullRecords: "View Full Records",
    name: "Name",
    phone: "Phone",
    editProfile: "Edit Profile",
    noRecordsYet: "No health records yet",
    addRecord: "Add Health Record",
    bookConsultationDesc: "Book a consultation with a doctor online",
    bookNow: "Book Now",
    findMedicinesDesc: "Find medicines and pharmacies near you",
    searchMedicines: "Search Medicines",
    symptomCheckerDesc: "Check your symptoms with our AI symptom checker",
    startCheck: "Start Check",
    emergencyDesc: "Call ambulance or emergency services",
    callAmbulance: "Call Ambulance",
    editProfileDesc: "Edit your profile information",
  },
  hi: {
    appName: "सेहत नभा",
    onlineMode: "ऑनलाइन",
    offlineMode: "ऑफलाइन",
    selectLanguage: "भाषा चुनें",
    enterPhone: "फोन नंबर दर्ज करें",
    enterOtp: "ओटीपी दर्ज करें",
    selectRole: "अपनी भूमिका चुनें",
    patient: "मरीज़",
    doctor: "डॉक्टर",
    pharmacist: "फार्मासिस्ट",
    admin: "प्रशासक",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफाइल",
    healthRecords: "स्वास्थ्य रिकॉर्ड",
    telemedicine: "टेलीमेडिसिन",
    medicines: "दवाइयां",
    symptoms: "लक्षण",
    emergency: "आपातकाल",
    bookConsultation: "परामर्श बुक करें",
    findMedicine: "दवा खोजें",
    checkSymptoms: "लक्षण जांचें",
    callAmbulance: "एम्बुलेंस बुलाएं",
    accessibility: "पहुंच",
    fontSize: "फ़ॉन्ट आकार",
    highContrast: "उच्च कंट्रास्ट",
    voiceInput: "आवाज़ इनपुट",
    screenReader: "स्क्रीन रीडर मोड",
    phoneVerification: "फ़ोन सत्यापन",
    enterPhoneNumber: "ओटीपी प्राप्त करने के लिए अपना फ़ोन नंबर दर्ज करें",
    phoneNumber: "फ़ोन नंबर",
    sendOTP: "ओटीपी भेजें",
    back: "वापस",
    verifyOTP: "ओटीपी सत्यापित करें",
    otpSentTo: "ओटीपी भेजा गया",
    enterOTP: "ओटीपी दर्ज करें",
    chooseYourRole: "जारी रखने के लिए अपनी भूमिका चुनें",
    continue: "जारी रखें",
    patientDescription: "अपॉइंटमेंट बुक करें, स्वास्थ्य रिकॉर्ड देखें",
    doctorDescription: "मरीजों का प्रबंधन करें, दवाएं लिखें",
    pharmacistDescription: "इन्वेंटरी प्रबंधित करें, नुस्खे संसाधित करें",
    adminDescription: "उपयोगकर्ताओं, सिस्टम सेटिंग्स को प्रबंधित करें",
    welcome: "स्वागत",
    connectWithDoctor: "डॉक्टर के साथ वर्चुअल परामर्श बुक करें",
    aiSymptomChecker: "हमारे एआई सहायक के साथ अपने लक्षणों की जांच करें",
    healthSummary: "आपका स्वास्थ्य सारांश",
    recentActivity: "हाल की गतिविधि",
    viewFullRecords: "पूर्ण रिकॉर्ड देखें",
    name: "नाम",
    phone: "फ़ोन",
    editProfile: "प्रोफ़ाइल संपादित करें",
    noRecordsYet: "अभी तक कोई स्वास्थ्य रिकॉर्ड नहीं है",
    addRecord: "स्वास्थ्य रिकॉर्ड जोड़ें",
    bookConsultationDesc: "ऑनलाइन डॉक्टर से परामर्श बुक करें",
    bookNow: "अभी बुक करें",
    findMedicinesDesc: "अपने आस-पास की दवाएं और फार्मेसियों का पता लगाएं",
    searchMedicines: "दवाएं खोजें",
    symptomCheckerDesc: "हमारे एआई लक्षण जांचकर्ता के साथ अपने लक्षणों की जांच करें",
    startCheck: "जांच शुरू करें",
    emergencyDesc: "एम्बुलेंस या आपातकालीन सेवाओं को कॉल करें",
    callAmbulance: "एम्बुलेंस बुलाओ",
    editProfileDesc: "अपनी प्रोफ़ाइल जानकारी संपादित करें",
  },
  pa: {
    appName: "ਸਿਹਤ ਨਭਾ",
    onlineMode: "ਆਨਲਾਈਨ",
    offlineMode: "ਆਫਲਾਈਨ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    enterPhone: "ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ",
    enterOtp: "ਓਟੀਪੀ ਦਾਖਲ ਕਰੋ",
    selectRole: "ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ",
    patient: "ਮਰੀਜ਼",
    doctor: "ਡਾਕਟਰ",
    pharmacist: "ਫਾਰਮਾਸਿਸਟ",
    admin: "ਪ੍ਰਸ਼ਾਸਕ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    healthRecords: "ਸਿਹਤ ਰਿਕਾਰਡ",
    telemedicine: "ਟੈਲੀਮੈਡੀਸਿਨ",
    medicines: "ਦਵਾਈਆਂ",
    symptoms: "ਲੱਛਣ",
    emergency: "ਐਮਰਜੈਂਸੀ",
    bookConsultation: "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
    findMedicine: "ਦਵਾਈ ਲੱਭੋ",
    checkSymptoms: "ਲੱਛਣ ਜਾਂਚੋ",
    callAmbulance: "ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ",
    accessibility: "ਪਹੁੰਚ",
    fontSize: "ਫੌਂਟ ਸਾਈਜ਼",
    highContrast: "ਉੱਚ ਕੰਟਰਾਸਟ",
    voiceInput: "ਆਵਾਜ਼ ਇਨਪੁੱਟ",
    screenReader: "ਸਕਰੀਨ ਰੀਡਰ ਮੋਡ",
    phoneVerification: "ਫੋਨ ਤਸਦੀਕ",
    enterPhoneNumber: "OTP ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣਾ ਫ਼ੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ",
    phoneNumber: "ਫੋਨ ਨੰਬਰ",
    sendOTP: "OTP ਭੇਜੋ",
    back: "ਵਾਪਸ",
    verifyOTP: "OTP ਤਸਦੀਕ ਕਰੋ",
    otpSentTo: "OTP ਭੇਜਿਆ ਗਿਆ",
    enterOTP: "OTP ਦਰਜ ਕਰੋ",
    chooseYourRole: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ",
    continue: "ਜਾਰੀ ਰੱਖੋ",
    patientDescription: "ਮੁਲਾਕਾਤਾਂ ਬੁੱਕ ਕਰੋ, ਸਿਹਤ ਰਿਕਾਰਡ ਵੇਖੋ",
    doctorDescription: "ਮਰੀਜ਼ਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਦਵਾਈਆਂ ਲਿਖੋ",
    pharmacistDescription: "ਇਨਵੈਂਟਰੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਨੁਸਖੇ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰੋ",
    adminDescription: "ਉਪਭੋਗਤਾਵਾਂ, ਸਿਸਟਮ ਸੈਟਿੰਗਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    connectWithDoctor: "ਇੱਕ ਡਾਕਟਰ ਨਾਲ ਵਰਚੁਅਲ ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
    aiSymptomChecker: "ਸਾਡੇ ਏਆਈ ਸਹਾਇਕ ਨਾਲ ਆਪਣੇ ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ",
    healthSummary: "ਤੁਹਾਡਾ ਸਿਹਤ ਸੰਖੇਪ",
    recentActivity: "ਹਾਲ ਹੀ ਦੀ ਗਤੀਵਿਧੀ",
    viewFullRecords: "ਪੂਰੇ ਰਿਕਾਰਡ ਵੇਖੋ",
    name: "ਨਾਮ",
    phone: "ਫੋਨ",
    editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ",
    noRecordsYet: "ਅਜੇ ਤੱਕ ਕੋਈ ਸਿਹਤ ਰਿਕਾਰਡ ਨਹੀਂ ਹੈ",
    addRecord: "ਸਿਹਤ ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ",
    bookConsultationDesc: "ਆਨਲਾਈਨ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
    bookNow: "ਹੁਣੇ ਬੁੱਕ ਕਰੋ",
    findMedicinesDesc: "ਆਪਣੇ ਨੇੜੇ ਦਵਾਈਆਂ ਅਤੇ ਫਾਰਮੇਸੀਆਂ ਲੱਭੋ",
    searchMedicines: "ਦਵਾਈਆਂ ਲੱਭੋ",
    symptomCheckerDesc: "ਸਾਡੇ ਏਆਈ ਲੱਛਣ ਜਾਂਚਕਰਤਾ ਨਾਲ ਆਪਣੇ ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ",
    startCheck: "ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ",
    emergencyDesc: "ਐਂਬੂਲੈਂਸ ਜਾਂ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨੂੰ ਕਾਲ ਕਰੋ",
    callAmbulance: "ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ",
    editProfileDesc: "ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਸੰਪਾਦਿਤ ਕਰੋ",
  },
}

export default function SehatNabhaApp() {
  const [language, setLanguage] = useState<Language>("en")
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
  const [highContrast, setHighContrast] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [screenReaderMode, setScreenReaderMode] = useState(false)

  const [step, setStep] = useState<"language" | "phone" | "otp" | "role" | "dashboard">("language")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient")
  const [user, setUser] = useState<AppUser | null>(null)
  const { isOnline, isSyncing, pendingSyncCount, saveOfflineData, getOfflineData, forcSync } = useOffline()

  const [activePatientTab, setActivePatientTab] = useState<
    "dashboard" | "profile" | "records" | "telemedicine" | "medicines" | "symptoms" | "emergency"
  >("dashboard")

  const [activeDoctorTab, setActiveDoctorTab] = useState<
    "dashboard" | "queue" | "consultation" | "prescriptions" | "patients" | "schedule"
  >("dashboard")

  const [activePharmacyTab, setActivePharmacyTab] = useState<
    "dashboard" | "inventory" | "prescriptions" | "orders" | "suppliers" | "reports"
  >("dashboard")

  const [activeAdminTab, setActiveAdminTab] = useState<
    "dashboard" | "users" | "analytics" | "health-data" | "system" | "settings"
  >("dashboard")

  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [isInConsultation, setIsInConsultation] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState("")
  const [newPrescription, setNewPrescription] = useState<Partial<Prescription>>({
    medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    diagnosis: "",
    notes: "",
  })

  const [patientQueue] = useState<Patient[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      age: 45,
      phone: "+91 98765 43210",
      symptoms: "Fever, headache, body pain for 3 days",
      appointmentTime: "10:30 AM",
      status: "waiting",
      priority: "medium",
    },
    {
      id: "2",
      name: "Priya Singh",
      age: 32,
      phone: "+91 87654 32109",
      symptoms: "Chest pain, difficulty breathing",
      appointmentTime: "11:00 AM",
      status: "waiting",
      priority: "high",
    },
    {
      id: "3",
      name: "Harpreet Kaur",
      age: 28,
      phone: "+91 76543 21098",
      symptoms: "Regular checkup, diabetes follow-up",
      appointmentTime: "11:30 AM",
      status: "waiting",
      priority: "low",
    },
  ])

  const [medicineInventory, setMedicineInventory] = useState<Medicine[]>([
    {
      id: "1",
      name: "Paracetamol 500mg",
      genericName: "Acetaminophen",
      manufacturer: "Sun Pharma",
      batchNumber: "PCM001",
      expiryDate: "2025-12-31",
      quantity: 150,
      minStockLevel: 50,
      price: 2.5,
      category: "tablet",
      prescription: false,
    },
    {
      id: "2",
      name: "Amoxicillin 250mg",
      genericName: "Amoxicillin",
      manufacturer: "Cipla",
      batchNumber: "AMX002",
      expiryDate: "2025-08-15",
      quantity: 25,
      minStockLevel: 30,
      price: 8.0,
      category: "capsule",
      prescription: true,
    },
    {
      id: "3",
      name: "Metformin 500mg",
      genericName: "Metformin HCl",
      manufacturer: "Dr. Reddy's",
      batchNumber: "MET003",
      expiryDate: "2026-03-20",
      quantity: 200,
      minStockLevel: 100,
      price: 3.2,
      category: "tablet",
      prescription: true,
    },
    {
      id: "4",
      name: "Cough Syrup",
      genericName: "Dextromethorphan",
      manufacturer: "Himalaya",
      batchNumber: "CS004",
      expiryDate: "2025-06-30",
      quantity: 8,
      minStockLevel: 15,
      price: 45.0,
      category: "syrup",
      prescription: false,
    },
  ])

  const [prescriptionOrders, setPrescriptionOrders] = useState<PrescriptionOrder[]>([
    {
      id: "1",
      patientName: "Rajesh Kumar",
      doctorName: "Dr. Singh",
      medicines: [
        {
          medicineId: "1",
          medicineName: "Paracetamol 500mg",
          quantity: 10,
          dosage: "1 tablet",
          instructions: "Take twice daily after meals",
        },
        {
          medicineId: "2",
          medicineName: "Amoxicillin 250mg",
          quantity: 21,
          dosage: "1 capsule",
          instructions: "Take thrice daily for 7 days",
        },
      ],
      status: "pending",
      orderDate: "2024-12-17",
      priority: "normal",
    },
    {
      id: "2",
      patientName: "Priya Singh",
      doctorName: "Dr. Kaur",
      medicines: [
        {
          medicineId: "3",
          medicineName: "Metformin 500mg",
          quantity: 30,
          dosage: "1 tablet",
          instructions: "Take twice daily before meals",
        },
      ],
      status: "ready",
      orderDate: "2024-12-16",
      priority: "urgent",
    },
  ])

  const t = translations[language]

  useEffect(() => {
    const initOfflineDB = async () => {
      try {
        await offlineDB.init()
        console.log("[v0] Offline database initialized")

        // Load cached data if offline
        if (!isOnline) {
          const cachedMedicines = await getOfflineData("medicine")
          const cachedPrescriptions = await getOfflineData("prescription")

          if (cachedMedicines.length > 0) {
            setMedicineInventory(cachedMedicines)
            console.log("[v0] Loaded cached medicine data")
          }

          if (cachedPrescriptions.length > 0) {
            setPrescriptionOrders(cachedPrescriptions)
            console.log("[v0] Loaded cached prescription data")
          }
        }
      } catch (error) {
        console.error("[v0] Failed to initialize offline database:", error)
      }
    }

    initOfflineDB()
  }, [isOnline, getOfflineData])

  const updateMedicineStock = async (medicineId: string, newQuantity: number) => {
    const updatedInventory = medicineInventory.map((med) =>
      med.id === medicineId ? { ...med, quantity: newQuantity } : med,
    )
    setMedicineInventory(updatedInventory)

    // Save to offline storage
    try {
      const updatedMedicine = updatedInventory.find((med) => med.id === medicineId)
      if (updatedMedicine) {
        await saveOfflineData("medicine", medicineId, updatedMedicine)
      }
      console.log("[v0] Updated stock for medicine:", medicineId, "New quantity:", newQuantity)
    } catch (error) {
      console.error("[v0] Failed to save medicine update offline:", error)
    }
  }

  const updatePrescriptionStatus = async (orderId: string, newStatus: PrescriptionOrder["status"]) => {
    const updatedOrders = prescriptionOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order,
    )
    setPrescriptionOrders(updatedOrders)

    // Save to offline storage
    try {
      const updatedOrder = updatedOrders.find((order) => order.id === orderId)
      if (updatedOrder) {
        await saveOfflineData("prescription", orderId, updatedOrder)
      }
      console.log("[v0] Updated prescription status:", orderId, "New status:", newStatus)
    } catch (error) {
      console.error("[v0] Failed to save prescription update offline:", error)
    }
  }

  const getLowStockMedicines = () => {
    return medicineInventory.filter((med) => med.quantity <= med.minStockLevel)
  }

  const getExpiringMedicines = () => {
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    return medicineInventory.filter((med) => {
      const expiryDate = new Date(med.expiryDate)
      return expiryDate <= threeMonthsFromNow
    })
  }

  const startConsultation = (patient: Patient) => {
    console.log("[v0] Starting consultation with:", patient.name)
    // Implementation for starting consultation
  }

  const AccessibilityControls = () => (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur">
            <Settings className="h-4 w-4" />
            <span className="sr-only">{t.accessibility}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{t.accessibility}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.fontSize}</Label>
              <div className="flex gap-1">
                {(["small", "medium", "large"] as const).map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontSize(size)}
                    className="flex-1"
                  >
                    {size === "small" ? "A" : size === "medium" ? "A" : "A"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.highContrast}</Label>
              <Button
                variant={highContrast ? "default" : "outline"}
                size="sm"
                onClick={() => setHighContrast(!highContrast)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.voiceInput}</Label>
              <Button
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.screenReader}</Label>
              <Button
                variant={screenReaderMode ? "default" : "outline"}
                size="sm"
                onClick={() => setScreenReaderMode(!screenReaderMode)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  if (step === "language") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4 ${
          fontSize === "large" ? "text-lg" : fontSize === "small" ? "text-sm" : ""
        } ${highContrast ? "bg-black text-white" : ""}`}
      >
        <AccessibilityControls />
        <Card className={`w-full max-w-md ${highContrast ? "bg-gray-900 border-white" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-600">Sehat Nabha</CardTitle>
            <p className="text-gray-600">Rural Healthcare Platform</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ</Label>
              <div className="grid gap-3">
                {(["en", "hi", "pa"] as const).map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? "default" : "outline"}
                    className={`h-14 text-left justify-start ${highContrast ? "border-white" : ""}`}
                    onClick={() => {
                      setLanguage(lang)
                      setStep("phone")
                    }}
                  >
                    <div>
                      <div className="font-medium">{lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "ਪੰਜਾਬੀ"}</div>
                      <div className="text-sm opacity-70">
                        {lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Punjabi"}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "phone") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4 ${
          fontSize === "large" ? "text-lg" : fontSize === "small" ? "text-sm" : ""
        } ${highContrast ? "bg-black text-white" : ""}`}
      >
        <AccessibilityControls />
        <Card className={`w-full max-w-md ${highContrast ? "bg-gray-900 border-white" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-600">{t.phoneVerification}</CardTitle>
            <p className="text-gray-600">{t.enterPhoneNumber}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phoneNumber}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`h-12 text-lg ${highContrast ? "border-white bg-gray-800" : ""}`}
              />
            </div>
            <Button
              onClick={() => {
                if (phone.length >= 10) {
                  setStep("otp")
                }
              }}
              className="w-full h-12 text-lg"
              disabled={phone.length < 10}
            >
              {t.sendOTP}
            </Button>
            <Button variant="ghost" onClick={() => setStep("language")} className="w-full">
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "otp") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4 ${
          fontSize === "large" ? "text-lg" : fontSize === "small" ? "text-sm" : ""
        } ${highContrast ? "bg-black text-white" : ""}`}
      >
        <AccessibilityControls />
        <Card className={`w-full max-w-md ${highContrast ? "bg-gray-900 border-white" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-600">{t.verifyOTP}</CardTitle>
            <p className="text-gray-600">
              {t.otpSentTo} {phone}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t.enterOTP}</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`h-12 text-lg text-center ${highContrast ? "border-white bg-gray-800" : ""}`}
                maxLength={6}
              />
            </div>
            <Button
              onClick={() => {
                if (otp.length === 6) {
                  setStep("role")
                }
              }}
              className="w-full h-12 text-lg"
              disabled={otp.length !== 6}
            >
              {t.verifyOTP}
            </Button>
            <Button variant="ghost" onClick={() => setStep("phone")} className="w-full">
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "role") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4 ${
          fontSize === "large" ? "text-lg" : fontSize === "small" ? "text-sm" : ""
        } ${highContrast ? "bg-black text-white" : ""}`}
      >
        <AccessibilityControls />
        <Card className={`w-full max-w-md ${highContrast ? "bg-gray-900 border-white" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-600">{t.selectRole}</CardTitle>
            <p className="text-gray-600">{t.chooseYourRole}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {(["patient", "doctor", "pharmacist", "admin"] as const).map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  className={`h-16 text-left justify-start ${highContrast ? "border-white" : ""}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {role === "patient" ? "🏥" : role === "doctor" ? "👨‍⚕️" : role === "pharmacist" ? "💊" : "👨‍💼"}
                    </div>
                    <div>
                      <div className="font-medium">{t[role]}</div>
                      <div className="text-sm opacity-70">{t[`${role}Description` as keyof typeof t]}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              onClick={() => {
                const newUser: AppUser = {
                  id: Date.now().toString(),
                  phone,
                  role: selectedRole,
                  name: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} User`,
                  language,
                }
                setUser(newUser)
                setStep("dashboard")
              }}
              className="w-full h-12 text-lg"
            >
              {t.continue}
            </Button>
            <Button variant="ghost" onClick={() => setStep("otp")} className="w-full">
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "dashboard" && user?.role === "patient") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{t.appName}</h1>
                <p className="text-sm text-muted-foreground">
                  {t.welcome}, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
              <Button variant="ghost" size="sm" onClick={() => setUser(null)}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-card border-b border-border p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {[
              { id: "dashboard", icon: BarChart3, label: t.dashboard },
              { id: "profile", icon: User, label: t.profile },
              { id: "records", icon: FileText, label: t.healthRecords },
              { id: "telemedicine", icon: Video, label: t.telemedicine },
              { id: "medicines", icon: Pill, label: t.medicines },
              { id: "symptoms", icon: Brain, label: t.symptoms },
              { id: "emergency", icon: Phone, label: t.emergency },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activePatientTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
                onClick={() => setActivePatientTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Patient Dashboard Content */}
        <main className="p-4 space-y-6">
          {activePatientTab === "dashboard" && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActivePatientTab("telemedicine")}
                >
                  <div className="flex items-center space-x-3">
                    <Video className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{t.bookConsultation}</h3>
                      <p className="text-sm text-muted-foreground">{t.connectWithDoctor}</p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActivePatientTab("symptoms")}
                >
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{t.checkSymptoms}</h3>
                      <p className="text-sm text-muted-foreground">{t.aiSymptomChecker}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>{t.healthSummary}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">72</div>
                      <div className="text-sm text-muted-foreground">Heart Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">120/80</div>
                      <div className="text-sm text-muted-foreground">Blood Pressure</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setActivePatientTab("records")}
                  >
                    {t.viewFullRecords}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Consultation with Dr. Singh</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted">
                      <Pill className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prescription filled</p>
                        <p className="text-xs text-muted-foreground">5 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activePatientTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.profile}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t.name}</label>
                    <p className="text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.phone}</label>
                    <p className="text-lg">{user?.phone}</p>
                  </div>
                </div>
                <Button className="w-full">{t.editProfile}</Button>
              </CardContent>
            </Card>
          )}

          {activePatientTab === "records" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.healthRecords}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.noRecordsYet}</p>
                <Button className="w-full mt-4">{t.addRecord}</Button>
              </CardContent>
            </Card>
          )}

          {activePatientTab === "telemedicine" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.telemedicine}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.bookConsultationDesc}</p>
                <Button className="w-full mt-4">{t.bookNow}</Button>
              </CardContent>
            </Card>
          )}

          {activePatientTab === "medicines" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.medicines}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.findMedicinesDesc}</p>
                <Button className="w-full mt-4">{t.searchMedicines}</Button>
              </CardContent>
            </Card>
          )}

          {activePatientTab === "symptoms" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.symptoms}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.symptomCheckerDesc}</p>
                <Button className="w-full mt-4">{t.startCheck}</Button>
              </CardContent>
            </Card>
          )}

          {activePatientTab === "emergency" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">{t.emergency}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t.emergencyDesc}</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Phone className="h-4 w-4 mr-2" />
                  {t.callAmbulance}
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    )
  }

  if (step === "dashboard" && user?.role === "admin") {
    // Mock admin data
    const totalUsers = 1247
    const totalPatients = 892
    const totalDoctors = 23
    const totalPharmacists = 15
    const totalConsultations = 156
    const activeConsultations = 8
    const totalPrescriptions = 234
    const systemUptime = "99.8%"

    const regionData = [
      { district: "Amritsar", patients: 234, doctors: 8, pharmacies: 5, consultations: 45 },
      { district: "Ludhiana", patients: 198, doctors: 6, pharmacies: 4, consultations: 38 },
      { district: "Jalandhar", patients: 167, doctors: 4, pharmacies: 3, consultations: 32 },
      { district: "Patiala", patients: 145, doctors: 3, pharmacies: 2, consultations: 28 },
      { district: "Bathinda", patients: 148, doctors: 2, pharmacies: 1, consultations: 13 },
    ]

    const healthMetrics = [
      { condition: "Diabetes", cases: 234, trend: "+12%" },
      { condition: "Hypertension", cases: 189, trend: "+8%" },
      { condition: "Respiratory Issues", cases: 156, trend: "-5%" },
      { condition: "Heart Disease", cases: 98, trend: "+3%" },
      { condition: "Mental Health", cases: 67, trend: "+18%" },
    ]

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{t.appName} - Admin</h1>
                <p className="text-sm text-muted-foreground">System Administrator • {totalUsers} total users</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
              {pendingSyncCount > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{pendingSyncCount} pending</span>
                </Badge>
              )}
              <Badge variant="default" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Uptime: {systemUptime}</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-card border-b border-border p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "users", icon: Users, label: "User Management" },
              { id: "analytics", icon: FileText, label: "Analytics" },
              { id: "health-data", icon: Stethoscope, label: "Health Data" },
              { id: "system", icon: AlertTriangle, label: "System Monitor" },
              { id: "settings", icon: Edit, label: "Settings" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeAdminTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
                onClick={() => setActiveAdminTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-4">
          {activeAdminTab === "dashboard" && (
            <div className="space-y-6">
              {/* System Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Video className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{activeConsultations}</p>
                    <p className="text-sm text-muted-foreground">Active Consultations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clipboard className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalPrescriptions}</p>
                    <p className="text-sm text-muted-foreground">Prescriptions Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{systemUptime}</p>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                  </CardContent>
                </Card>
              </div>

              {(!isOnline || pendingSyncCount > 0) && <OfflineIndicator showDetails={true} />}

              {/* Regional Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Punjab Regional Health Overview</CardTitle>
                  <CardDescription>Healthcare metrics across major districts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionData.map((region) => (
                      <div key={region.district} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{region.district}</p>
                            <p className="text-sm text-muted-foreground">
                              {region.patients} patients • {region.doctors} doctors • {region.pharmacies} pharmacies
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{region.consultations}</p>
                          <p className="text-xs text-muted-foreground">Consultations</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Trends */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Health Conditions</CardTitle>
                    <CardDescription>Most common conditions in rural Punjab</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {healthMetrics.map((metric) => (
                      <div key={metric.condition} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{metric.condition}</p>
                          <p className="text-sm text-muted-foreground">{metric.cases} cases</p>
                        </div>
                        <Badge variant={metric.trend.startsWith("+") ? "destructive" : "default"} className="text-xs">
                          {metric.trend}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>Real-time system metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Active Users</span>
                      <span className="font-bold">456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultations Today</span>
                      <span className="font-bold">{totalConsultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicine Orders</span>
                      <span className="font-bold">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Calls</span>
                      <span className="font-bold text-destructive">3</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeAdminTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="flex space-x-2">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Patients</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Stethoscope className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalDoctors}</p>
                    <p className="text-sm text-muted-foreground">Doctors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Pill className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalPharmacists}</p>
                    <p className="text-sm text-muted-foreground">Pharmacists</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Rajesh Kumar", role: "patient", location: "Amritsar", date: "2024-12-17" },
                    { name: "Dr. Priya Singh", role: "doctor", location: "Ludhiana", date: "2024-12-16" },
                    { name: "Harpreet Kaur", role: "patient", location: "Jalandhar", date: "2024-12-16" },
                    { name: "Pharmacy Plus", role: "pharmacist", location: "Patiala", date: "2024-12-15" },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.location} • {user.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeAdminTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">System Analytics</h2>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Active Users</span>
                      <span className="font-bold">456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Active Users</span>
                      <span className="font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Active Users</span>
                      <span className="font-bold">3,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Session Duration</span>
                      <span className="font-bold">12m 34s</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { feature: "Telemedicine", usage: "78%", trend: "+12%" },
                      { feature: "Medicine Finder", usage: "65%", trend: "+8%" },
                      { feature: "Health Records", usage: "54%", trend: "+15%" },
                      { feature: "Symptom Checker", usage: "43%", trend: "+22%" },
                      { feature: "Emergency Services", usage: "12%", trend: "-3%" },
                    ].map((item) => (
                      <div key={item.feature} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.feature}</p>
                          <p className="text-sm text-muted-foreground">Usage: {item.usage}</p>
                        </div>
                        <Badge variant={item.trend.startsWith("+") ? "default" : "secondary"} className="text-xs">
                          {item.trend}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeAdminTab === "health-data" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Health Data Insights</h2>
                <Badge variant="outline">Punjab Rural Health Initiative</Badge>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disease Prevalence by District</CardTitle>
                    <CardDescription>Most common health conditions across Punjab</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {regionData.map((region) => (
                        <div key={region.district} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{region.district}</span>
                            <span className="text-sm text-muted-foreground">{region.patients} patients</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 bg-destructive/10 rounded text-center">
                              <p className="font-medium">Diabetes</p>
                              <p>{Math.floor(region.patients * 0.26)}</p>
                            </div>
                            <div className="p-2 bg-secondary/10 rounded text-center">
                              <p className="font-medium">Hypertension</p>
                              <p>{Math.floor(region.patients * 0.21)}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded text-center">
                              <p className="font-medium">Respiratory</p>
                              <p>{Math.floor(region.patients * 0.17)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Health Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Treatment Success Rate</span>
                      <span className="font-bold text-primary">87.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient Satisfaction</span>
                      <span className="font-bold text-primary">4.6/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up Compliance</span>
                      <span className="font-bold text-secondary">72.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Response Time</span>
                      <span className="font-bold text-primary">8.2 min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeAdminTab === "system" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">System Monitor</h2>
                <Badge variant="default" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>All Systems Operational</span>
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Server Status</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Response Time</span>
                      <span className="font-bold">245ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Storage Usage</span>
                      <span className="font-bold">67%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Offline Sync</span>
                      <Badge variant={pendingSyncCount === 0 ? "default" : "secondary"}>
                        {pendingSyncCount === 0 ? "Up to date" : `${pendingSyncCount} pending`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-secondary/10 rounded">
                      <AlertTriangle className="h-4 w-4 text-secondary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">High API usage detected</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-primary/10 rounded">
                      <Clock className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Scheduled maintenance completed</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-destructive/10 rounded">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Database backup completed</p>
                        <p className="text-xs text-muted-foreground">12 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeAdminTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">System Settings</h2>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>System Name</Label>
                      <Input defaultValue="Sehat Nabha - Rural Healthcare Platform" />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Language</Label>
                      <Input defaultValue="Punjabi (ਪੰਜਾਬੀ)" />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      <Input defaultValue="+91 108 (Punjab Emergency)" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Toggles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { feature: "Telemedicine", enabled: true },
                      { feature: "AI Symptom Checker", enabled: true },
                      { feature: "Medicine Delivery", enabled: false },
                      { feature: "Emergency Services", enabled: true },
                      { feature: "Health Records Sync", enabled: true },
                    ].map((toggle) => (
                      <div key={toggle.feature} className="flex items-center justify-between">
                        <span>{toggle.feature}</span>
                        <Badge variant={toggle.enabled ? "default" : "secondary"}>
                          {toggle.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (step === "dashboard" && user?.role === "pharmacist") {
    const lowStockCount = getLowStockMedicines().length
    const expiringCount = getExpiringMedicines().length
    const pendingOrders = prescriptionOrders.filter((order) => order.status === "pending").length
    const readyOrders = prescriptionOrders.filter((order) => order.status === "ready").length

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Pill className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{t.appName} - Pharmacy</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.name} • {pendingOrders} pending orders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">{lowStockCount} Low Stock</span>
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-card border-b border-border p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "inventory", icon: Pill, label: "Inventory" },
              { id: "prescriptions", icon: FileText, label: "Prescriptions" },
              { id: "orders", icon: Clock, label: "Orders" },
              { id: "suppliers", icon: Users, label: "Suppliers" },
              { id: "reports", icon: BarChart3, label: "Reports" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activePharmacyTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
                onClick={() => setActivePharmacyTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-4">
          {activePharmacyTab === "dashboard" && (
            <div className="space-y-6">
              {!isOnline && (
                <Card className="border-secondary">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <WifiOff className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="font-medium">Working Offline</p>
                        <p className="text-sm text-muted-foreground">
                          Inventory updates are saved locally and will sync when connection is restored.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Pill className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{medicineInventory.length}</p>
                    <p className="text-sm text-muted-foreground">Total Medicines</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-2xl font-bold">{lowStockCount}</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{readyOrders}</p>
                    <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {(lowStockCount > 0 || expiringCount > 0) && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lowStockCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                        <div>
                          <p className="font-medium text-destructive">{lowStockCount} medicines below minimum stock</p>
                          <p className="text-sm text-muted-foreground">Reorder required immediately</p>
                        </div>
                        <Button size="sm" onClick={() => setActivePharmacyTab("inventory")}>
                          View Details
                        </Button>
                      </div>
                    )}
                    {expiringCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                        <div>
                          <p className="font-medium text-secondary">{expiringCount} medicines expiring soon</p>
                          <p className="text-sm text-muted-foreground">Within next 3 months</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setActivePharmacyTab("inventory")}>
                          Check Expiry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescription Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prescriptionOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{order.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.medicines.length} medicines • Dr. {order.doctorName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            order.status === "pending" ? "secondary" : order.status === "ready" ? "default" : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                        {order.priority === "urgent" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activePharmacyTab === "inventory" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Medicine Inventory</h2>
                <div className="flex space-x-2">
                  <Input placeholder="Search medicines..." className="max-w-sm" />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {medicineInventory.map((medicine) => {
                  const isLowStock = medicine.quantity <= medicine.minStockLevel
                  const isExpiringSoon = getExpiringMedicines().some((m) => m.id === medicine.id)

                  return (
                    <Card key={medicine.id} className={isLowStock ? "border-destructive" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Pill className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{medicine.name}</p>
                                {isLowStock && (
                                  <Badge variant="destructive" className="text-xs">
                                    Low Stock
                                  </Badge>
                                )}
                                {isExpiringSoon && (
                                  <Badge variant="secondary" className="text-xs">
                                    Expiring Soon
                                  </Badge>
                                )}
                                {medicine.prescription && (
                                  <Badge variant="outline" className="text-xs">
                                    Rx
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {medicine.genericName} • {medicine.manufacturer}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Batch: {medicine.batchNumber} • Expires: {medicine.expiryDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-lg font-bold">{medicine.quantity}</p>
                                <p className="text-xs text-muted-foreground">In Stock</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold">₹{medicine.price}</p>
                                <p className="text-xs text-muted-foreground">Per Unit</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newQuantity = prompt(
                                    `Update stock for ${medicine.name}:`,
                                    medicine.quantity.toString(),
                                  )
                                  if (newQuantity && !isNaN(Number(newQuantity))) {
                                    updateMedicineStock(medicine.id, Number(newQuantity))
                                  }
                                }}
                              >
                                Update Stock
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activePharmacyTab === "prescriptions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Prescription Orders</h2>
                <Badge variant="outline">{prescriptionOrders.length} total orders</Badge>
              </div>

              <div className="space-y-4">
                {prescriptionOrders.map((order) => (
                  <Card key={order.id} className={order.priority === "urgent" ? "border-destructive" : ""}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {order.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{order.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                Prescribed by Dr. {order.doctorName} • {order.orderDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "secondary"
                                  : order.status === "processing"
                                    ? "default"
                                    : order.status === "ready"
                                      ? "default"
                                      : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                            {order.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Prescribed Medicines:</Label>
                          {order.medicines.map((medicine, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <p className="font-medium">{medicine.medicineName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {medicine.dosage} • Qty: {medicine.quantity} • {medicine.instructions}
                                </p>
                              </div>
                              <div className="text-right">
                                {medicineInventory.find((m) => m.id === medicine.medicineId)?.quantity ||
                                0 >= medicine.quantity ? (
                                  <Badge variant="default" className="text-xs">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          {order.status === "pending" && (
                            <Button size="sm" onClick={() => updatePrescriptionStatus(order.id, "processing")}>
                              Start Processing
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button size="sm" onClick={() => updatePrescriptionStatus(order.id, "ready")}>
                              Mark Ready
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button size="sm" onClick={() => updatePrescriptionStatus(order.id, "dispensed")}>
                              Mark Dispensed
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Print Label
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activePharmacyTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Management</h2>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reorder Required</CardTitle>
                    <CardDescription>Medicines below minimum stock level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getLowStockMedicines().map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Current: {medicine.quantity} • Min: {medicine.minStockLevel}
                            </p>
                          </div>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        </div>
                      ))}
                      {getLowStockMedicines().length === 0 && (
                        <p className="text-center text-muted-foreground py-4">All medicines are adequately stocked</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activePharmacyTab === "suppliers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Suppliers</h2>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  { name: "Sun Pharma Distributors", contact: "+91 98765 43210", medicines: 45, rating: "4.8" },
                  { name: "Cipla Medical Supply", contact: "+91 87654 32109", medicines: 32, rating: "4.6" },
                  { name: "Dr. Reddy's Regional", contact: "+91 76543 21098", medicines: 28, rating: "4.9" },
                ].map((supplier, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {supplier.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.medicines} medicines • ★ {supplier.rating}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activePharmacyTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Reports & Analytics</h2>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Today's Sales</span>
                      <span className="font-bold">₹2,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-bold">₹18,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="font-bold">₹75,600</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Medicines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "Paracetamol 500mg", sold: 45, revenue: "₹112" },
                      { name: "Metformin 500mg", sold: 32, revenue: "₹102" },
                      { name: "Amoxicillin 250mg", sold: 18, revenue: "₹144" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sold} units sold</p>
                        </div>
                        <span className="font-bold">{item.revenue}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (step === "dashboard" && user?.role === "doctor") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{t.appName} - Doctor</h1>
                <p className="text-sm text-muted-foreground">
                  Dr. {user?.name} • {patientQueue.filter((p) => p.status === "waiting").length} patients waiting
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
              {isInConsultation && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Video className="h-3 w-3" />
                  <span className="text-xs">In Consultation</span>
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-card border-b border-border p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "queue", icon: Users, label: "Patient Queue" },
              { id: "consultation", icon: Video, label: "Consultation" },
              { id: "prescriptions", icon: Clipboard, label: "Prescriptions" },
              { id: "patients", icon: FileText, label: "Patient Records" },
              { id: "schedule", icon: CalendarIcon, label: "Schedule" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeDoctorTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
                onClick={() => setActiveDoctorTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-4">
          {activeDoctorTab === "dashboard" && (
            <div className="space-y-6">
              {!isOnline && (
                <Card className="border-secondary">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <WifiOff className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="font-medium">Working Offline</p>
                        <p className="text-sm text-muted-foreground">
                          Consultation notes and prescriptions are saved locally and will sync when connection is
                          restored.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{patientQueue.filter((p) => p.status === "waiting").length}</p>
                    <p className="text-sm text-muted-foreground">Waiting</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Video className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{patientQueue.filter((p) => p.status === "completed").length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-2xl font-bold">{patientQueue.filter((p) => p.priority === "high").length}</p>
                    <p className="text-sm text-muted-foreground">Urgent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">2.5h</p>
                    <p className="text-sm text-muted-foreground">Avg. Wait</p>
                  </CardContent>
                </Card>
              </div>

              {/* Next Patient */}
              {patientQueue.filter((p) => p.status === "waiting").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Patient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {patientQueue[0].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patientQueue[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            Age {patientQueue[0].age} • {patientQueue[0].appointmentTime}
                          </p>
                          <p className="text-sm text-muted-foreground">{patientQueue[0].symptoms}</p>
                        </div>
                      </div>
                      <Button onClick={() => startConsultation(patientQueue[0])}>
                        <Video className="h-4 w-4 mr-2" />
                        Start Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Video className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Consultation with Rajesh Kumar</p>
                      <p className="text-sm text-muted-foreground">Completed • 9:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Clipboard className="h-5 w-5 text-secondary" />
                    <div className="flex-1">
                      <p className="font-medium">Prescription sent to Priya Singh</p>
                      <p className="text-sm text-muted-foreground">10:15 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeDoctorTab === "queue" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Patient Queue</h2>
                <Badge variant="outline">{patientQueue.length} patients</Badge>
              </div>

              <div className="space-y-4">
                {patientQueue.map((patient) => (
                  <Card key={patient.id} className={patient.priority === "high" ? "border-destructive" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{patient.name}</p>
                              <Badge
                                variant={
                                  patient.priority === "high"
                                    ? "destructive"
                                    : patient.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {patient.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {patient.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Age {patient.age} • {patient.appointmentTime}
                            </p>
                            <p className="text-sm text-muted-foreground">{patient.symptoms}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Records
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startConsultation(patient)}
                            disabled={patient.status !== "waiting"}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {patient.status === "waiting" ? "Start" : "View"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add other doctor tabs content here */}
        </main>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 ${
        fontSize === "large" ? "text-lg" : fontSize === "small" ? "text-sm" : ""
      } ${highContrast ? "bg-black text-white" : ""}`}
    >
      <AccessibilityControls />

      {screenReaderMode && (
        <div className="sr-only" aria-live="polite" id="screen-reader-announcements">
          Current page: {activePatientTab || activeDoctorTab || activePharmacyTab || "dashboard"}
        </div>
      )}

      {/* Add other doctor tabs content here */}
    </div>
  )
}
