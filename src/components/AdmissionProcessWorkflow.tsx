import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  FileCheck, 
  ExternalLink, 
  Info, 
  ArrowDown, 
  CheckCircle2, 
  GraduationCap, 
  Sparkles,
  Award
} from 'lucide-react';
import { AdmissionProcessData, AdmissionProcessStep } from '../types';

interface AdmissionProcessWorkflowProps {
  admissionProcess?: AdmissionProcessData;
}

const defaultIntroText = "Online centralized admission process is conducted by Maharashtra Council of Agriculture Education & Research (MCAER), Pune and CET Cell after the declaration of results of MHT-CET/NEET/JEE and the procedure of admission is as follows:";
const defaultCapUrl = "https://cetcell.mahacet.org/";

const defaultSteps: AdmissionProcessStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Declaration of results of MHT-CET / NEET / JEE",
    description: "Results and scorecards are officially declared by state and national exam bodies (CET Cell / NTA)."
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "Online CAP registration (application) form filling",
    description: "Eligible candidates must complete online registration on the official Maharashtra State CET Cell portal.",
    linkUrl: "https://cetcell.mahacet.org/",
    linkText: "Visit CET Cell Portal"
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "Complete the CAP registration form",
    description: "Fill personal details, academic scores, category specifications, and upload necessary certificates."
  },
  {
    id: "step-4",
    stepNumber: 4,
    title: "Display of Merit List",
    description: "Provisional and Final merit lists are published online after scrutiny of submitted application forms."
  },
  {
    id: "step-5",
    stepNumber: 5,
    title: "Submission of College Preferences",
    description: "Candidates submit online option forms listing preferred institutes (LSSCDT Malkapur) and courses."
  },
  {
    id: "step-6",
    stepNumber: 6,
    title: "Display of Round-wise Allotment List",
    description: "Seat allotment results published for CAP Round I, Round II, and subsequent institutional rounds."
  },
  {
    id: "step-7",
    stepNumber: 7,
    title: "Reporting by Students to Respective College",
    description: "Allotted candidates report physically to LSSCDT Malkapur with all original documents within specified dates."
  },
  {
    id: "step-8",
    stepNumber: 8,
    title: "Document Verification",
    description: "Physical verification of original academic marksheets, scorecards, caste, and domicile certificates."
  },
  {
    id: "step-9",
    stepNumber: 9,
    title: "Admission Confirmation",
    description: "Final fee payment and issuance of official admission confirmation receipt by the institute."
  }
];

export const AdmissionProcessWorkflow: React.FC<AdmissionProcessWorkflowProps> = ({ admissionProcess }) => {
  const shouldReduceMotion = useReducedMotion();

  const introText = admissionProcess?.introText || defaultIntroText;
  const capUrl = admissionProcess?.capRegistrationUrl || defaultCapUrl;
  const steps = admissionProcess?.steps && admissionProcess.steps.length > 0 
    ? admissionProcess.steps 
    : defaultSteps;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header Section */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full w-fit mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Centralized Admission Process (CAP)
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-amber-600 shrink-0" />
          Admission Process & Workflow
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Step-by-step guidance for B.Tech (Dairy Technology) admissions through MCAER & CET Cell Maharashtra.
        </p>
      </div>

      {/* Introductory Information Box */}
      <motion.div 
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2342] to-[#123866] p-6 text-white shadow-lg border border-slate-800"
      >
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300 shrink-0 mt-0.5">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold tracking-wider text-amber-300 uppercase">
              Important MCAER & CET Cell Notice
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
              {introText}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={capUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0A2342] font-bold text-xs sm:text-sm rounded-lg shadow transition-all transform hover:-translate-y-0.5"
              >
                <span>State CET Cell Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="text-xs text-slate-300 font-medium">
                Official CET Cell URL: <code className="bg-white/10 px-2 py-0.5 rounded text-amber-200">{capUrl}</code>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vertical Workflow Steps */}
      <div className="relative py-4">
        
        {/* Central Connecting Vertical Line */}
        <div 
          className="absolute left-6 sm:left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-[#0A2342] via-teal-600 to-amber-500 rounded-full" 
          aria-hidden="true"
        />

        <div className="space-y-6 sm:space-y-8 relative">
          {steps.map((step, index) => {
            const isCapStep = step.stepNumber === 2 || (step.linkUrl && step.linkUrl.length > 0);
            const isLastStep = index === steps.length - 1;

            return (
              <motion.div
                key={step.id || `step-${index}`}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.05 }}
                className="relative flex items-start gap-4 sm:gap-6 group"
              >
                {/* Step Number Circle Indicator */}
                <div className="relative z-10 shrink-0">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-lg shadow-md border-2 transition-transform duration-300 group-hover:scale-105 ${
                    isLastStep
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-200'
                      : 'bg-[#0A2342] text-amber-400 border-amber-400/80 shadow-slate-300'
                  }`}>
                    {String(step.stepNumber).padStart(2, '0')}
                  </div>
                </div>

                {/* Step Content Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 hover:border-teal-500/60 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-2">
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Step {step.stepNumber} of {steps.length}
                    </span>

                    {isLastStep && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Final Step
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#0A2342] leading-snug">
                    {step.title}
                  </h3>

                  {step.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {/* Clickable CET Cell Link for Step 2 or any step with linkUrl */}
                  {isCapStep && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <a
                        href={step.linkUrl || capUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200/90 transition-colors group/link"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-teal-600 group-hover/link:translate-x-0.5 transition-transform" />
                        <span>{step.linkText || "Online CAP Registration Portal (cetcell.mahacet.org)"}</span>
                      </a>
                    </div>
                  )}

                </div>

                {/* Arrow Connector Indicator (unless last step) */}
                {!isLastStep && (
                  <div className="absolute left-6 sm:left-8 -bottom-5 transform -translate-x-1/2 z-20 pointer-events-none text-teal-600 opacity-80">
                    <ArrowDown className="w-4 h-4 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Banner */}
      <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0A2342]">
              Need Guidance During Admission Process?
            </h4>
            <p className="text-xs text-slate-600">
              Our Admission Cell is available for guidance, document verification queries, and option form assistance.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-xs font-bold text-[#0A2342] bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-sm">
          Helpline: +91 8625869560
        </div>
      </div>

    </div>
  );
};
