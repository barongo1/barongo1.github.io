# Academic Project Brief: Gtouch Inclusive Assessment & SkillLink Micro-Credentials Platform

---

## Executive Summary & Abstract

The **Gtouch Inclusive Assessment & SkillLink Platform** (`gtouch/iep`) is an enterprise-grade, full-stack software system and modular PHP/Laravel package designed to address critical challenges in special needs educational assessment, competency-based TVET (Technical and Vocational Education and Training) evaluation, and labor-market skills verification.

Engineered with a **decoupled architecture**, the platform pairs a high-performance RESTful API backend with a responsive Vue 3 Single-Page Application (SPA). It integrates real-time WebRTC video consultation, automated M-Pesa mobile payment processing, multi-channel SMS notifications, real-time WebSocket messaging, and a regional geographic hierarchy for localized diagnostic and employment workflows.

---

## 1. Key Academic & Engineering Highlights

- **Modular Package Architecture**: Built as a reusable, PSR-4 compliant Laravel package ([`composer.json`](file:///home/ogilo/Projects/iep/composer.json)) managed via custom Service Providers ([`IepServiceProvider.php`](file:///home/ogilo/Projects/iep/src/IepServiceProvider.php)) and Facades ([`Iep.php`](file:///home/ogilo/Projects/iep/src/Iep.php)).
- **Domain-Driven Design (DDD)**: Implemented across multi-tier domain models, separating psychological/educational assessment logic, diagnostic scoring, micro-credential verification, and affiliate commission management.
- **Decoupled Modern Frontend Architecture**: Extracted Vue 3 SPA leveraging PrimeVue UI, PrimeFlex, Chart.js for diagnostic analytics, and Pinia/Vuex state management.
- **Fintech Integration**: Custom SDK integration for Safaricom M-Pesa Daraja API for STK Push payment processing, automated callback ledgers, and dynamic commission splitting.
- **Real-Time Tele-Consultation & Communication**: Native WebRTC signaling layer for remote specialist assessment, paired with Pusher WebSocket messaging and asynchronous MoveSMS dispatch queues.
- **Verification Engine**: Digital micro-credentialing system supporting cryptographic hash generation, dynamic QR-code verification, stackable learning pathways, and automated PDF transcript generation.

---

## 2. System Architecture Diagrams

### 2.1 High-Level System Architecture Topology

This diagram illustrates the overall system components, client applications, API gateway layer, core services, database persistence, and external service integrations.

```mermaid
graph TB
    subgraph Clients ["Client Applications Layer"]
        VueSPA["Vue 3 SPA Client<br/>(PrimeVue, Chart.js, Pinia)"]
        MobileApp["Mobile Application<br/>(Android / iOS API Client)"]
        PublicVerifier["Public Web Portal<br/>(Credential Verification)"]
    end

    subgraph Gateway ["API & Auth Gateway Layer"]
        Sanctum["Laravel Sanctum Auth"]
        APIRoutes["RESTful API v1 Routes<br/>(/api/v1)"]
        CORS["CORS & WebSocket Middleware"]
    end

    subgraph CoreBackend ["Laravel Package Core (gtouch/iep)"]
        ServiceProvider["IepServiceProvider<br/>(Boot & Service Registry)"]
        
        subgraph DomainModules ["Domain Modules"]
            AssessmentMod["Assessment & Diagnostic Engine"]
            CredentialMod["Micro-Credentialing & Verification"]
            FintechMod["M-Pesa Payment & Commission Ledger"]
            CommsMod["Real-Time Comms & WebRTC Engine"]
            LocationMod["Kenyan Geographic Hierarchy Engine"]
        end
    end

    subgraph DataStorage ["Data & File Infrastructure"]
        Database[("Relational DB<br/>(MySQL / PostgreSQL)")]
        RedisCache[("Redis Cache & Queue Store")]
        Storage[("Polymorphic File Storage<br/>(PDF Reports, Portfolio Assets)")]
    end

    subgraph ExternalServices ["Third-Party Integrations"]
        MPesaAPI["Safaricom M-Pesa Daraja API<br/>(STK Push Payments)"]
        MoveSMS["MoveSMS Gateway<br/>(Asynchronous SMS Queue)"]
        PusherWS["Pusher WebSockets<br/>(Live Chat & Notifications)"]
        SnappyPDF["Snappy / wkhtmltopdf<br/>(PDF Report Engine)"]
    end

    %% Connections
    VueSPA -->|HTTPS / REST| Sanctum
    MobileApp -->|HTTPS / REST| Sanctum
    PublicVerifier -->|HTTPS / REST| APIRoutes

    Sanctum --> APIRoutes
    APIRoutes --> CORS
    CORS --> ServiceProvider

    ServiceProvider --> AssessmentMod
    ServiceProvider --> CredentialMod
    ServiceProvider --> FintechMod
    ServiceProvider --> CommsMod
    ServiceProvider --> LocationMod

    AssessmentMod --> Database
    CredentialMod --> Database
    FintechMod --> Database
    CommsMod --> Database
    LocationMod --> Database

    AssessmentMod --> SnappyPDF
    CredentialMod --> Storage
    FintechMod <-->|STK Callback| MPesaAPI
    CommsMod --> MoveSMS
    CommsMod <--> PusherWS
    CoreBackend <--> RedisCache
```

---

### 2.2 Layered Software Architecture (Package Internal Design)

This diagram breaks down the internal **Domain-Driven Design (DDD)** layers within the `Gtouch\Iep` Laravel package.

```mermaid
graph TD
    subgraph PresentationLayer ["1. Presentation & HTTP Layer"]
        Controllers["API V1 Controllers<br/>(AssessmentController, KitController, AuthController)"]
        FormRequests["Form Request Validators"]
        ResourceTransformers["API Json Resources"]
    end

    subgraph ApplicationLayer ["2. Application & Business Logic Layer"]
        AuthService["AuthService"]
        SmsService["SmsService"]
        ReportService["ReportService"]
        Events["Domain Events<br/>(UserRegistered, AssessmentCompleted)"]
        Listeners["Queued Listeners<br/>(IssueCommission, NotifyAssessmentComplete)"]
    end

    subgraph DomainLayer ["3. Domain & Security Layer"]
        GatePolicies["Security Gates & Permissions<br/>(IepServiceProvider Gate Registry)"]
        RBAC["Role-Based Access Control<br/>(Admin, Candidate, Guardian, Specialist, Agent)"]
        EloquentModels["Eloquent Models<br/>(User, Assessment, Kit, Candidate, Commission)"]
    end

    subgraph InfrastructureLayer ["4. Infrastructure & Persistence Layer"]
        Migrations["Database Migrations<br/>(60+ Schema Files)"]
        SDKs["M-Pesa PHP SDK & MoveSMS Client"]
        FileSys["Polymorphic File System"]
    end

    %% Data Flow
    Controllers --> FormRequests
    FormRequests --> AuthService
    FormRequests --> ReportService
    FormRequests --> SmsService
    
    AuthService --> GatePolicies
    ReportService --> Events
    Events --> Listeners

    GatePolicies --> RBAC
    RBAC --> EloquentModels

    EloquentModels --> Migrations
    Listeners --> SDKs
    ReportService --> FileSys
```

---

### 2.3 Core Functional Workflow & Data Pipeline

This sequence diagram illustrates the lifecycle of a complete **Assessment, Payment, Commission Allocation, and Automated Notification** flow.

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate / Guardian
    participant App as Vue 3 SPA / Mobile
    participant API as API Controller (V1)
    participant Mpesa as M-Pesa SDK / Daraja API
    participant EventBus as Event Dispatcher
    participant Listener as Commission & Notification Listeners
    participant SMS as MoveSMS Gateway

    User->>App: Initiate Assessment Purchase
    App->>API: POST /api/v1/mpesa/stkpush (Phone, Kit ID)
    API->>Mpesa: Trigger STK Push Request
    Mpesa-->>User: Prompts M-Pesa PIN input on phone
    User->>Mpesa: Enters PIN & Confirms Payment
    Mpesa->>API: Webhook Callback (/api/v1/mcallback)
    
    API->>API: Verify & Record Transaction (MpesaTransaction)
    API->>EventBus: Dispatch AssessmentCompleted Event
    
    par Asynchronous Processing
        EventBus->>Listener: Trigger IssueCommission Listener
        Listener->>API: Calculate & Allocate Agent Commission
    and
        EventBus->>Listener: Trigger NotifyAssessmentComplete Listener
        Listener->>SMS: Queue SMS Notification to User & Specialist
        SMS-->>User: Delivers SMS Receipt & Assessment Link
    end

    API-->>App: Payment Verified (Real-time Status Update)
    App-->>User: Unlocks Diagnostic Assessment Kit
```

---

## 3. Core Modules & Subsystems

### 1. Assessment & Diagnostic Engine
- **Hierarchical Kit Structure**: Organizes diagnostic modules into categories, target age brackets ([`KitAge`](file:///home/ogilo/Projects/iep/src/Models/KitAge.php)), questions, weighted answer options, and automated scoring thresholds.
- **Specialist Matching & Referral**: Evaluates candidate responses to match developmental needs with qualified specialists ([`SpecialistCategory`](file:///home/ogilo/Projects/iep/src/Models/SpecialistCategory.php)) and automated diagnostic summaries ([`Summary`](file:///home/ogilo/Projects/iep/src/Models/Summary.php)).
- **PDF Report Generation**: Automated rendering of structured assessment reports using `barryvdh/laravel-snappy` (wkhtmltopdf integration).

### 2. Digital Micro-Credentialing Engine (*SkillLink Extension*)
- **Competency Framework Alignment**: Maps learning modules to industry-defined competency standards.
- **Stackable Micro-Credentials**: Allows granular credential units to aggregate into full institutional certifications.
- **Tamper-Proof Verification**: Generates cryptographic hashes and public QR codes for instant online verification (`/api/v1/credentials/verify/{hash}`).

### 3. Fintech & Affiliate Monetization Subsystem
- **M-Pesa Gateway Integration**: Real-time STK Push processing via custom M-Pesa PHP SDK ([`MpesaTransaction`](file:///home/ogilo/Projects/iep/src/Models/MpesaTransaction.php)).
- **Agent Commission Pipeline**: Tracks user registrations and assessment payments back to regional agents ([`Agent`](file:///home/ogilo/Projects/iep/src/Models/Agent.php)), automatically issuing ledgered payouts ([`Commission`](file:///home/ogilo/Projects/iep/src/Models/Commission.php)).

### 4. Geographic & Administrative Hierarchy
- **Geographic Data Model**: Complete Kenyan administrative partitioning ([`County`](file:///home/ogilo/Projects/iep/src/Models/County.php) $\rightarrow$ [`SubCounty`](file:///home/ogilo/Projects/iep/src/Models/SubCounty.php) $\rightarrow$ [`Ward`](file:///home/ogilo/Projects/iep/src/Models/Ward.php)) for regional specialist discovery and institution registration.

### 5. Real-Time Telehealth & Communication
- **WebRTC Video Signaling**: Integrated signaling framework ([`VideoController`](file:///home/ogilo/Projects/iep/src/Http/Controllers/Api/V1/VideoController.php)) enabling peer-to-peer assessment calls.
- **Asynchronous Messaging**: Multi-tenant chat system ([`Chat`](file:///home/ogilo/Projects/iep/src/Models/Chat.php), [`Message`](file:///home/ogilo/Projects/iep/src/Models/Message.php)) over Pusher WebSockets paired with scheduled background SMS queues (`sms:send`).

---

## 4. Technical Stack Specifications

| Layer | Component | Technology / Library |
|---|---|---|
| **Backend Core** | PHP Framework | Laravel 9 / 10 / 11 (PSR-4 Package Architecture) |
| **Authentication** | API Token Auth & Access Control | Laravel Sanctum, Fine-grained Gate Policies, Custom RBAC |
| **Frontend Framework** | SPA Web Client | Vue 3, Vue Router, Vuex / Pinia |
| **UI Components & Styling** | User Interface System | PrimeVue 3, PrimeFlex, Sass, FontAwesome, Montserrat |
| **Database & ORM** | Relational DB & Persistence | MySQL / PostgreSQL, Laravel Eloquent ORM |
| **Payment Gateway** | Mobile Money Processing | Safaricom M-Pesa Daraja API, Custom M-Pesa PHP SDK |
| **Messaging & WebSockets** | Real-Time Events & Comms | Pusher Server SDK, MoveSMS API |
| **Video Infrastructure** | Remote Tele-Consultation | WebRTC Signaling Engine |
| **Document Rendering** | PDF Generation | `barryvdh/laravel-snappy` (wkhtmltopdf engine) |
| **Testing & CI** | Testing & API Documentation | PHPUnit, Orchestra Testbench, Scribe (`knuckleswtf/scribe`) |

---

## 5. Research & Social Impact Context

1. **Educational Inclusion**: Provides standardized digital diagnostic instruments for early identification of special learning needs, bridging the gap between clinical assessment and educational intervention.
2. **TVET Skills Verification & Labor Market Alignment**: Solves the global "skills mismatch" by replacing traditional unverified credentials with stackable, cryptographic micro-credentials linked directly to verified competencies and industrial attachment outcomes.
3. **Decentralized Service Delivery**: Enables regional agents and specialists in underserved geographic zones to deliver diagnostic assessment and career placement services using mobile payment rails and SMS infrastructure.

---

## 6. Academic Profile & CV Portfolio Snippet

```markdown
### Gtouch Inclusive Assessment & SkillLink Digital Micro-Credentialing System
*Lead Software Engineer / Architect* | **Technologies:** PHP/Laravel, Vue 3, PostgreSQL, M-Pesa Daraja API, WebRTC, Pusher, Docker

- Designed and developed a modular, full-stack enterprise Laravel package (`gtouch/iep`) for inclusive special-needs educational assessment and digital TVET micro-credentialing.
- Engineered a decoupled architecture featuring a RESTful API backend (30+ controllers) paired with a responsive Vue 3 SPA utilizing PrimeVue, Chart.js, and Pinia/Vuex.
- Integrated automated mobile payment processing (Safaricom M-Pesa STK Push SDK) with a region-aware commission distribution engine for local assessment agents.
- Implemented real-time tele-assessment capabilities via a WebRTC signaling engine, Pusher WebSocket messaging, and MoveSMS queue-backed dispatch systems.
- Built a cryptographic digital credentialing pipeline supporting QR-code verification, stackable competency frameworks, and automated PDF diagnostic reporting.
```
