import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import ExportButton from "./ExportButton";

// Detect which enhancement type(s) a lesson contains
function detectEnhancementType(lesson) {
  const keys = [];
  if (lesson.enhancedObjectives) keys.push("objectives");
  if (lesson.detailedActivities) keys.push("activities");
  if (lesson.comprehensiveResources) keys.push("resources");
  if (lesson.assessmentStrategies) keys.push("assessments");
  return keys.length ? keys : ["general"];
}

// ---------- Renderers for each enhancement type ----------
const RenderObjectives = ({ objectives }) => (
  <div className="mt-3">
    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
      🎯 Enhanced Objectives
    </h6>
    {objectives.map((obj, oi) => (
      <div key={oi} className="border-l-4 border-indigo-400 pl-3 mb-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          <strong>{obj.level}</strong>: {obj.objective}
        </p>
        {obj.successCriteria?.length > 0 && (
          <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
            {obj.successCriteria.map((c, ci) => (
              <li key={ci}>{c}</li>
            ))}
          </ul>
        )}
        {obj.cbcCompetency && (
          <p className="text-xs text-indigo-500 mt-1">
            CBC Competency: {obj.cbcCompetency}
          </p>
        )}
      </div>
    ))}
  </div>
);

const RenderActivities = ({ details }) => (
  <div className="mt-3">
    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
      🧩 Learning Activities
    </h6>
    {details?.starter && (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <strong>Starter ({details.starter.duration}):</strong>{" "}
        {details.starter.activity}{" "}
        <span className="text-xs text-gray-500">
          — {details.starter.purpose}
        </span>
      </p>
    )}
    {details?.main?.length > 0 && (
      <div className="mt-1">
        <strong className="text-sm text-gray-700 dark:text-gray-300">
          Main Activities:
        </strong>
        <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
          {details.main.map((a, i) => (
            <li key={i}>
              {a.activity}{" "}
              <span className="text-xs">
                ({a.duration}, {a.grouping})
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {details?.plenary && (
      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
        <strong>Plenary ({details.plenary.duration}):</strong>{" "}
        {details.plenary.activity}{" "}
        <span className="text-xs text-gray-500">
          — {details.plenary.assessment}
        </span>
      </p>
    )}
    {details?.ictIntegration && (
      <p className="text-xs text-blue-500 mt-1">
        💻 ICT Integration: {details.ictIntegration}
      </p>
    )}
  </div>
);

const RenderResources = ({ resources }) => (
  <div className="mt-3">
    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
      📚 Lesson Resources
    </h6>
    {resources?.digital?.length > 0 && (
      <div>
        <strong className="text-xs text-gray-500">Digital:</strong>
        <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
          {resources.digital.map((d, i) => (
            <li key={i}>
              {d.name} ({d.type}) —{" "}
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline"
              >
                link
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
    {resources?.physical?.length > 0 && (
      <div className="mt-1">
        <strong className="text-xs text-gray-500">Physical:</strong>
        <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
          {resources.physical.map((p, i) => (
            <li key={i}>
              {p.item} — {p.purpose}
            </li>
          ))}
        </ul>
      </div>
    )}
    {resources?.alternatives?.length > 0 && (
      <div className="mt-1">
        <strong className="text-xs text-gray-500">Alternatives:</strong>
        <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
          {resources.alternatives.map((a, i) => (
            <li key={i}>
              Instead of {a.insteadOf}, use {a.use} ({a.reason})
            </li>
          ))}
        </ul>
      </div>
    )}
    {resources?.localMaterials?.length > 0 && (
      <p className="text-xs mt-1 text-green-600 dark:text-green-400">
        🏡 Local Materials: {resources.localMaterials.join(", ")}
      </p>
    )}
  </div>
);

const RenderAssessments = ({ assess }) => (
  <div className="mt-3">
    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
      🧠 Assessment Strategies
    </h6>
    {assess?.formative?.length > 0 && (
      <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
        {assess.formative.map((f, i) => (
          <li key={i}>
            {f.strategy} ({f.timing}) — {f.feedback}
          </li>
        ))}
      </ul>
    )}
    {assess?.summative && (
      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
        <strong>Summative:</strong> {assess.summative.description} (
        {assess.summative.type}, {assess.summative.marks} marks)
      </p>
    )}
    {assess?.peerAssessment && (
      <p className="text-xs text-indigo-500 mt-1">
        👥 Peer Assessment: {assess.peerAssessment}
      </p>
    )}
  </div>
);

// ---------- Main Component ----------
const PreviewEnhancedScheme = ({ scheme, goBack }) => {
  if (!scheme || !scheme.enhanced) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-300">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
        <p>No enhanced scheme data available.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          ← Back to Configuration
        </button>
      </div>
    );
  }

  const { original, enhanced } = scheme;
  const enhancedWeeks = enhanced.enhancedWeeks || enhanced.weeks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="text-green-500" />
          Generated Enhanced Scheme
        </h3>
        <button
          onClick={goBack}
          className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Regenerate / Edit
        </button>
      </div>

      {/* Context Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Original Context
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {original.subject} – Form {original.form}, Term {original.term}
        </p>
      </div>

      {/* Weeks */}
      {enhancedWeeks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <p>No structured week data detected in response.</p>
        </div>
      ) : (
        enhancedWeeks.map((week, wi) => {
          const originalWeek = original.weeks?.[wi] || {};
          return (
            <details
              key={wi}
              className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <summary className="cursor-pointer px-5 py-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800">
                <h4 className="text-lg font-semibold text-indigo-600">
                  Week {week.week_number || wi + 1}
                </h4>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Original Week */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      📖 Original Scheme
                    </h5>
                    <ExportButton
                      data={{
                        subject: original.subject,
                        form: original.form,
                        term: original.term,
                        week_number: originalWeek.week_number,
                        lessons: originalWeek.lessons || [],
                      }}
                      filename={`original_week_${week.week_number || wi + 1}.json`}
                      format="json"
                      variant="subtle"
                    />
                  </div>
                  {originalWeek.lessons?.length > 0 ? (
                    originalWeek.lessons.map((lesson, li) => (
                      <div
                        key={li}
                        className="mb-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                      >
                        <h6 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                          Lesson {lesson.lesson_number || li + 1}:{" "}
                          {lesson.topic || lesson.subtopic || "Untitled Topic"}
                        </h6>
                        {lesson.subtopic && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {lesson.subtopic}
                          </p>
                        )}
                        {lesson.objectives && (
                          <p className="text-sm text-gray-700 dark:text-gray-400">
                            🎯 <strong>Objectives:</strong> {lesson.objectives}
                          </p>
                        )}
                        {lesson.activities && (
                          <p className="text-sm text-gray-700 dark:text-gray-400">
                            🧠 <strong>Activities:</strong> {lesson.activities}
                          </p>
                        )}
                        {lesson.resources && (
                          <p className="text-sm text-gray-700 dark:text-gray-400">
                            📚 <strong>Resources:</strong> {lesson.resources}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No original lessons found.
                    </p>
                  )}
                </div>

                {/* Enhanced Week */}
                <div className="p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-bold text-indigo-600">
                      ✨ Enhanced Scheme
                    </h5>
                    <ExportButton
                      data={{
                        subject: original.subject,
                        form: original.form,
                        term: original.term,
                        week_number: week.week_number,
                        lessons: week.lessons || [],
                      }}
                      filename={`enhanced_week_${week.week_number || wi + 1}.json`}
                      format="json"
                      variant="subtle"
                    />
                  </div>

                  {week.lessons?.length > 0 ? (
                    week.lessons.map((lesson, li) => {
                      const types = detectEnhancementType(lesson);
                      return (
                        <div
                          key={li}
                          className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                        >
                          <h6 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                            Lesson {lesson.lesson_number || li + 1}:{" "}
                            {lesson.topic || lesson.subtopic || "Untitled Topic"}
                          </h6>
                          {lesson.subtopic && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {lesson.subtopic}
                            </p>
                          )}

                          {types.includes("objectives") && (
                            <RenderObjectives
                              objectives={lesson.enhancedObjectives}
                            />
                          )}
                          {types.includes("activities") && (
                            <RenderActivities
                              details={lesson.detailedActivities}
                            />
                          )}
                          {types.includes("resources") && (
                            <RenderResources
                              resources={lesson.comprehensiveResources}
                            />
                          )}
                          {types.includes("assessments") && (
                            <RenderAssessments
                              assess={lesson.assessmentStrategies}
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No enhanced lessons found for this week.
                    </p>
                  )}
                </div>
              </div>
            </details>
          );
        })
      )}
    </div>
  );
};

export default PreviewEnhancedScheme;