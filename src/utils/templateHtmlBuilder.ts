import { SlipData } from "@/types";

/**
 * Builds a standalone, self-contained HTML page representing the exact A4 print sheet.
 * Includes Tailwind-like styling, inline SVGs, theme colors, and inlined Base64 photos.
 */
export function buildSlipSheetHtml(data: SlipData): string {
  const is8Slips = data.slipSize === "8" || data.slipSize === "large";
  const copiesCount = is8Slips ? 8 : 10;
  const slips = Array.from({ length: copiesCount }, (_, i) => i);

  const themeColor = data.colorTheme || "#6366f1";
  const isLight = themeColor === "#f8fafc" || themeColor === "#ffffff";
  const textColor = isLight ? "#1e293b" : "#ffffff";
  const typingDetailsColor = themeColor;

  const bgZoom = data.bgZoom ?? 100;
  const bgTilt = data.bgTilt ?? 0;
  const bgX = data.bgX ?? 0;
  const bgY = data.bgY ?? 0;

  const renderBgHtml = () => {
    if (!data.aiBackgroundUrl) return "";
    return `
      <div style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 0;">
        <img
          src="${data.aiBackgroundUrl}"
          alt="Background"
          style="width: 100%; height: 100%; object-fit: cover; transform: scale(${bgZoom / 100}) rotate(${bgTilt}deg) translate(${bgX}%, ${bgY}%); transform-origin: center center;"
        />
      </div>
    `;
  };

  const renderPhotoHtml = () => {
    if (!data.photoUrl) {
      return `
        <div style="width: 100%; height: 100%; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 7px; color: #94a3b8; font-weight: 500;">
          Photo
        </div>
      `;
    }
    return `
      <div style="width: 100%; height: 100%; position: relative; overflow: hidden; background: #ffffff;">
        <img
          src="${data.photoUrl}"
          alt="Student"
          style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoZoom / 100}) rotate(${data.photoTilt}deg) translate(${data.photoX}%, ${data.photoY}%); transform-origin: center center;"
        />
      </div>
    `;
  };

  const escapeHtml = (str: string | undefined | null) => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const studentName = escapeHtml(data.studentName);
  const schoolName = escapeHtml(data.schoolName);
  const grade = escapeHtml(data.grade);
  const section = escapeHtml(data.section);
  const rollNo = escapeHtml(data.rollNo);

  const renderSlipCell = (index: number) => {
    const slipSubjectRaw = data.subjectMode === "custom" ? data.subjects?.[index] || "" : data.subject || "";
    const slipSubject = escapeHtml(slipSubjectRaw);
    const photoFrameSize = data.photoFrameSize || 65;

    // 1. UNICORN
    if (data.template === "unicorn") {
      return `
        <div style="width: 100%; height: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; position: relative; background: linear-gradient(135deg, rgba(252, 231, 243, 0.6) 0%, rgba(250, 245, 255, 0.4) 50%, rgba(219, 234, 254, 0.6) 100%); padding: 8px; display: flex; gap: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); z-index: 10; box-sizing: border-box;">
          <div style="position: absolute; top: 4px; right: 8px; width: 6px; height: 6px; background: #fde047; border-radius: 50%; opacity: 0.75;"></div>

          <!-- Left: Rainbow Photo Frame -->
          <div style="position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: center; z-index: 20; width: ${photoFrameSize + 20}px; height: 100%;">
            <div style="border-radius: 50%; padding: 4.5px; background: linear-gradient(45deg, #fb7185, #fde047, #34d399, #60a5fa, #818cf8); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; width: ${photoFrameSize + 14}px; height: ${photoFrameSize + 14}px; box-sizing: border-box;">
              <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 1px solid #f1f5f9; position: relative;">
                ${renderPhotoHtml()}
              </div>
            </div>

            <!-- Cute Cartoon Unicorn SVG -->
            <div style="position: absolute; z-index: 30; width: ${(photoFrameSize + 14) * 0.65}px; height: ${(photoFrameSize + 14) * 0.65}px; bottom: -4px; left: -4px;">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M20 70 C 20 40, 45 40, 55 50 C 65 60, 60 80, 50 85 C 40 90, 20 85, 20 70 Z" fill="#ffffff" stroke="#ffb2d9" stroke-width="2.5" />
                <path d="M45 50 C 45 35, 55 25, 65 25 C 75 25, 85 30, 80 45 C 75 55, 55 60, 45 50 Z" fill="#ffffff" stroke="#ffb2d9" stroke-width="2.5" />
                <path d="M72 38 C 72 32, 85 32, 80 43 C 78 47, 72 43, 72 38 Z" fill="#ffe3ee" />
                <circle cx="76" cy="38" r="1.5" fill="#4a5568" />
                <ellipse cx="64" cy="35" rx="3" ry="4" fill="#4a5568" />
                <circle cx="63" cy="33" r="1" fill="#ffffff" />
                <path d="M66 32 C 67 30, 69 31, 70 33" stroke="#4a5568" stroke-width="1.2" stroke-linecap="round" />
                <path d="M68 25 L 78 8 L 73 22 Z" fill="#facc15" stroke="#eab308" stroke-width="1" />
                <path d="M42 45 C 38 35, 45 28, 48 20 C 52 28, 50 38, 48 45 Z" fill="#38bdf8" />
                <path d="M48 35 C 45 25, 52 18, 55 10 C 59 18, 56 28, 54 35 Z" fill="#fb7185" />
                <path d="M54 42 C 50 32, 57 25, 60 18 C 64 25, 62 32, 60 42 Z" fill="#facc15" />
                <circle cx="67" cy="42" r="3" fill="#ffaec9" opacity="0.7" />
              </svg>
            </div>
          </div>

          <!-- Right: Details -->
          <div style="flex: 1; border: 1px solid #fbcfe8; background: #ffffff; border-radius: 12px; padding: 8px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
            <div style="position: absolute; top: 4px; right: 8px; font-size: 10px; color: #f472b6; font-weight: bold; opacity: 0.75;">⭐</div>
            <div style="position: absolute; top: 24px; right: 4px; font-size: 8px; color: #818cf8; font-weight: bold; opacity: 0.7;">🎵</div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; position: relative; padding-right: 12px;">
              <!-- 1. Name -->
              <div style="position: relative; height: 24px; display: flex; align-items: flex-end;">
                <div style="position: absolute; bottom: 2px; left: 0; right: 0; border-bottom: 1px dashed #f472b6; width: 100%;"></div>
                <div style="position: relative; z-index: 10; display: flex; width: 100%; font-size: 8.5px; font-weight: 900; line-height: 1; color: ${themeColor};">
                  <span>Name:</span>
                  <span style="font-size: 10.5px; margin-left: 8px; font-weight: 900; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; color: ${typingDetailsColor};">${studentName}</span>
                </div>
              </div>

              <!-- 2. Subject -->
              <div style="position: relative; height: 24px; display: flex; align-items: flex-end;">
                <div style="position: absolute; bottom: 2px; left: 0; right: 0; border-bottom: 1px dashed #f472b6; width: 100%;"></div>
                <div style="position: relative; z-index: 10; display: flex; width: 100%; font-size: 8.5px; font-weight: 900; line-height: 1; color: ${themeColor};">
                  <span>Subject:</span>
                  <span style="font-size: 10px; margin-left: 8px; font-weight: 900; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${typingDetailsColor};">${slipSubject}</span>
                </div>
              </div>

              <!-- 3. Class & Division -->
              <div style="position: relative; height: 24px; display: flex; align-items: flex-end;">
                <div style="position: absolute; bottom: 2px; left: 0; right: 0; border-bottom: 1px dashed #f472b6; width: 100%;"></div>
                <div style="position: relative; z-index: 10; display: flex; width: 100%; font-size: 8.5px; font-weight: 900; line-height: 1; color: ${themeColor};">
                  <span>Class:</span>
                  <span style="font-size: 10px; margin-left: 6px; font-weight: 700; line-height: 1; color: ${typingDetailsColor};">${grade}</span>
                  <span style="margin-left: auto;">Division:</span>
                  <span style="font-size: 10px; margin-left: 6px; padding-right: 8px; font-weight: 700; line-height: 1; color: ${typingDetailsColor};">${section}</span>
                </div>
              </div>

              <!-- 4. Roll No -->
              <div style="position: relative; height: 24px; display: flex; align-items: flex-end;">
                <div style="position: absolute; bottom: 2px; left: 0; right: 0; border-bottom: 1px dashed #f472b6; width: 100%;"></div>
                <div style="position: relative; z-index: 10; display: flex; width: 100%; font-size: 8.5px; font-weight: 900; line-height: 1; color: ${themeColor};">
                  <span>Roll No:</span>
                  <span style="font-size: 10px; margin-left: 8px; font-weight: 700; line-height: 1; color: ${typingDetailsColor};">${rollNo}</span>
                </div>
              </div>
            </div>

            <!-- 5. School Footer -->
            <div style="text-align: center; padding-top: 2px; border-top: 1px solid rgba(252, 231, 243, 0.6); margin-top: 2px; flex-shrink: 0; min-height: 16px;">
              <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1.25; color: ${themeColor};">
                ${schoolName}
              </span>
            </div>
          </div>
        </div>
      `;
    }

    // 2. CLASSIC
    if (data.template === "classic") {
      return `
        <div style="width: 100%; height: 100%; border: 2px solid ${themeColor}; position: relative; display: flex; flex-direction: column; z-index: 10; justify-content: space-between; overflow: hidden; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); box-sizing: border-box;">
          ${renderBgHtml()}

          <div style="flex: 1; display: flex; padding: 8px; gap: 10px; z-index: 10; align-items: center; box-sizing: border-box;">
            <!-- Left: Details -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; height: 100%; padding-top: 2px; padding-bottom: 2px;">
              <!-- 1. Name -->
              <div style="display: flex; align-items: flex-end; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); padding-bottom: 2px; height: 20px;">
                <span style="font-size: 8px; font-weight: 900; width: 56px; flex-shrink: 0; color: ${themeColor};">Name:</span>
                <span style="font-size: 10.5px; font-weight: 900; margin-left: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; flex: 1; color: ${typingDetailsColor};">${studentName}</span>
              </div>
              <!-- 2. Subject -->
              <div style="display: flex; align-items: flex-end; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); padding-bottom: 2px; height: 20px;">
                <span style="font-size: 8px; font-weight: 900; width: 56px; flex-shrink: 0; color: ${themeColor};">Subject:</span>
                <span style="font-size: 10px; font-weight: 900; margin-left: 4px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; color: ${typingDetailsColor};">${slipSubject}</span>
              </div>
              <!-- 3. Class/Div -->
              <div style="display: flex; align-items: flex-end; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); padding-bottom: 2px; height: 20px;">
                <span style="font-size: 8px; font-weight: 900; width: 56px; flex-shrink: 0; color: ${themeColor};">Class/Div:</span>
                <span style="font-size: 9.5px; font-weight: 900; margin-left: 4px; line-height: 1; flex: 1; color: ${typingDetailsColor};">${grade}${section ? ` - ${section}` : ""}</span>
              </div>
              <!-- 4. Roll No -->
              <div style="display: flex; align-items: flex-end; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); padding-bottom: 2px; height: 20px;">
                <span style="font-size: 8px; font-weight: 900; width: 56px; flex-shrink: 0; color: ${themeColor};">Roll No:</span>
                <span style="font-size: 9.5px; font-weight: 900; margin-left: 4px; line-height: 1; flex: 1; color: ${typingDetailsColor};">${rollNo}</span>
              </div>
            </div>

            <!-- Right: Photo Frame -->
            <div style="border: 2px solid ${themeColor}; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 2px; background: rgba(255, 255, 255, 0.8); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden; width: ${photoFrameSize}px; height: ${photoFrameSize * 1.2}px; box-sizing: border-box;">
              ${renderPhotoHtml()}
            </div>
          </div>

          <!-- Bottom: School Name -->
          <div style="width: 100%; padding-top: 4px; padding-bottom: 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; flex-shrink: 0; min-height: 18px; background-color: ${themeColor}; color: ${textColor};">
            <h4 style="font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 0.025em; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 8px; padding-right: 8px; width: 100%; margin: 0;">${schoolName}</h4>
          </div>
        </div>
      `;
    }

    // 3. PLAYFUL
    if (data.template === "playful") {
      return `
        <div style="width: 100%; height: 100%; border-radius: 16px; overflow: hidden; border: 1px solid rgba(226, 232, 240, 0.8); position: relative; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); z-index: 10; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          ${renderBgHtml()}

          <div style="padding: 8px; padding-top: 10px; display: flex; gap: 10px; flex-grow: 1; position: relative; z-index: 10; align-items: center; box-sizing: border-box;">
            <!-- Left: Circular Photo Frame -->
            <div style="border-radius: 50%; border: 3px solid ${themeColor}; background: rgba(255, 255, 255, 0.8); overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); z-index: 20; display: flex; align-items: center; justify-content: center; padding: 2px; width: ${photoFrameSize + 8}px; height: ${photoFrameSize + 8}px; box-sizing: border-box;">
              <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden;">
                ${renderPhotoHtml()}
              </div>
            </div>

            <!-- Right: Details -->
            <div style="flex: 1; min-width: 0; z-index: 20; display: flex; flex-direction: column; gap: 6px;">
              <!-- 1. Name -->
              <div style="border-bottom: 1px solid rgba(203, 213, 225, 0.8); padding-bottom: 2px;">
                <p style="font-size: 6.5px; font-weight: 800; text-transform: uppercase; line-height: 1; margin: 0 0 2px 0; color: ${themeColor};">Name</p>
                <p style="font-weight: 900; font-size: 11px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; color: ${typingDetailsColor};">${studentName}</p>
              </div>

              <!-- 2. Sub, 3. Std/Div, 4. Roll -->
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 4px;">
                <div style="grid-column: span 2 / span 2; border-bottom: 1px solid rgba(203, 213, 225, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 800; text-transform: uppercase; display: block; line-height: 1; margin-bottom: 2px; color: ${themeColor};">Subject</span>
                  <span style="font-size: 9.5px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1; color: ${typingDetailsColor};">${slipSubject}</span>
                </div>
                <div style="border-bottom: 1px solid rgba(203, 213, 225, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 800; text-transform: uppercase; display: block; line-height: 1; margin-bottom: 2px; color: ${themeColor};">Class / Div</span>
                  <span style="font-size: 9px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1; color: ${typingDetailsColor};">${grade}${section ? ` - ${section}` : ""}</span>
                </div>
                <div style="border-bottom: 1px solid rgba(203, 213, 225, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 800; text-transform: uppercase; display: block; line-height: 1; margin-bottom: 2px; color: ${themeColor};">Roll No</span>
                  <span style="font-size: 9px; font-weight: 900; display: block; line-height: 1; color: ${typingDetailsColor};">${rollNo}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- School Banner -->
          <div style="height: 22px; position: relative; z-index: 10; display: flex; align-items: center; padding-left: 12px; padding-right: 12px; margin-top: 4px; flex-shrink: 0; background-color: ${themeColor};">
            <h4 style="font-weight: 900; font-size: 10px; color: #ffffff; letter-spacing: 0.025em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">
              ${schoolName}
            </h4>
          </div>
        </div>
      `;
    }

    // 4. DOODLE
    if (data.template === "doodle") {
      return `
        <div style="width: 100%; height: 100%; position: relative; overflow: hidden; z-index: 10; background: #fefce8; border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); border: 3px dashed ${themeColor}; box-sizing: border-box;">
          <div style="position: absolute; top: 8px; right: 16px; font-size: 24px;">⭐</div>
          <div style="position: absolute; bottom: 8px; left: 8px; font-size: 20px; opacity: 0.8;">✏️</div>
          <div style="position: absolute; bottom: 20px; right: 8px; font-size: 20px; opacity: 0.8;">🎨</div>

          <!-- Center Content Box -->
          <div style="position: absolute; inset: 0; margin: 12px; background: rgba(255, 255, 255, 0.95); border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); border: 2px solid ${themeColor}60; display: flex; flex-direction: column; padding: 6px; justify-content: space-between; z-index: 10; box-sizing: border-box;">
            <div style="display: flex; flex: 1; gap: 8px; align-items: center; padding-left: 4px; padding-right: 4px;">
              <div style="flex-shrink: 0; border-radius: 16px; overflow: hidden; border: 4px solid #ffffff; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); transform: rotate(-2deg); background: #eff6ff; width: ${photoFrameSize}px; height: ${photoFrameSize}px; box-sizing: border-box;">
                ${renderPhotoHtml()}
              </div>

              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; height: 100%; padding-top: 2px; padding-bottom: 2px;">
                <div>
                  <span style="font-size: 6px; font-weight: 900; color: #64748b; text-transform: uppercase; line-height: 1; margin-bottom: 2px; display: block;">My Name is:</span>
                  <span style="font-size: 11px; font-weight: 900; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; color: ${typingDetailsColor};">${studentName}</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 4px; row-gap: 4px; margin-top: 2px;">
                  <div style="grid-column: span 2 / span 2;">
                    <span style="font-size: 5.5px; font-weight: 900; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Subject</span>
                    ${
                      slipSubject
                        ? `<span style="font-size: 9px; font-weight: 900; padding: 2px 4px; border-radius: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; color: ${typingDetailsColor}; background-color: ${themeColor}15;">${slipSubject}</span>`
                        : `<div style="height: 10px; border-bottom: 1px dashed #fda4af; width: 100%;"></div>`
                    }
                  </div>
                  <div>
                    <span style="font-size: 5.5px; font-weight: 900; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Class & Div</span>
                    <span style="font-size: 8.5px; font-weight: 900; padding: 2px 4px; border-radius: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; color: ${typingDetailsColor}; background-color: ${themeColor}15;">${grade} ${section ? `- ${section}` : ""}</span>
                  </div>
                  <div>
                    <span style="font-size: 5.5px; font-weight: 900; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Roll No</span>
                    <span style="font-size: 8.5px; font-weight: 900; padding: 2px 4px; border-radius: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; color: ${typingDetailsColor}; background-color: ${themeColor}15;">${rollNo}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- School -->
            <div style="text-align: center; margin-top: 4px; padding-top: 4px; border-top: 2px dotted #fcd34d; flex-shrink: 0; min-height: 16px;">
              <span style="font-weight: 900; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 8px; color: ${themeColor};">
                ${schoolName}
              </span>
            </div>
          </div>
        </div>
      `;
    }

    // 5. SPACE EXPLORER
    if (data.template === "space") {
      return `
        <div style="width: 100%; height: 100%; position: relative; overflow: hidden; z-index: 10; background: linear-gradient(135deg, #0b0f2a 0%, #1a1c4b 50%, #2e1065 100%); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(99, 102, 241, 0.4); padding: 8px; display: flex; gap: 10px; align-items: center; box-sizing: border-box;">
          <div style="position: absolute; top: 4px; right: 8px; font-size: 12px; opacity: 0.9;">🪐</div>
          <div style="position: absolute; bottom: 4px; right: 32px; font-size: 10px; opacity: 0.75;">🚀</div>
          <div style="position: absolute; bottom: 16px; left: 12px; font-size: 9px; color: #fde047; opacity: 0.7;">⭐</div>

          <!-- Photo Frame with cosmic ring -->
          <div style="position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: center; z-index: 20; width: ${photoFrameSize + 10}px; height: 100%;">
            <div style="border-radius: 50%; padding: 3px; background: linear-gradient(45deg, #22d3ee, #818cf8, #d946ef); box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2); display: flex; align-items: center; justify-content: center; width: ${photoFrameSize + 8}px; height: ${photoFrameSize + 8}px; box-sizing: border-box;">
              <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 1px solid rgba(199, 210, 254, 0.4); position: relative; background: #0f172a;">
                ${renderPhotoHtml()}
              </div>
            </div>
          </div>

          <!-- Content Box -->
          <div style="flex: 1; background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 8px; position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(199, 210, 254, 0.6); z-index: 10; box-sizing: border-box;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-evenly;">
              <div style="border-bottom: 1px solid rgba(199, 210, 254, 0.8); padding-bottom: 2px;">
                <span style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; color: #4f46e5; display: block; line-height: 1; margin-bottom: 2px;">Astronaut Name</span>
                <span style="font-size: 11px; font-weight: 900; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; color: ${typingDetailsColor};">${studentName}</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 4px; margin-top: 2px;">
                <div style="grid-column: span 2 / span 2; border-bottom: 1px solid rgba(199, 210, 254, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; color: #4f46e5; display: block; line-height: 1; margin-bottom: 2px;">Subject</span>
                  <span style="font-size: 9.5px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1; color: ${typingDetailsColor};">${slipSubject}</span>
                </div>
                <div style="border-bottom: 1px solid rgba(199, 210, 254, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; color: #4f46e5; display: block; line-height: 1; margin-bottom: 2px;">Class / Div</span>
                  <span style="font-size: 9px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1; color: ${typingDetailsColor};">${grade}${section ? ` - ${section}` : ""}</span>
                </div>
                <div style="border-bottom: 1px solid rgba(199, 210, 254, 0.8); padding-bottom: 2px;">
                  <span style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; color: #4f46e5; display: block; line-height: 1; margin-bottom: 2px;">Roll No</span>
                  <span style="font-size: 9px; font-weight: 900; display: block; line-height: 1; color: ${typingDetailsColor};">${rollNo}</span>
                </div>
              </div>
            </div>

            <!-- School Footer -->
            <div style="text-align: center; padding-top: 4px; border-top: 1px solid #e0e7ff; margin-top: 4px; flex-shrink: 0; min-height: 15px;">
              <span style="font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #312e81; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 1.25;">
                ${schoolName}
              </span>
            </div>
          </div>
        </div>
      `;
    }

    // 6. MODERN (Default Fallback)
    return `
      <div style="width: 100%; height: 100%; border-radius: 12px; overflow: hidden; display: flex; border: 1px solid rgba(226, 232, 240, 0.8); position: relative; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); z-index: 10; box-sizing: border-box;">
        ${renderBgHtml()}
        <div style="width: 10px; height: 100%; flex-shrink: 0; z-index: 10; background-color: ${themeColor};"></div>

        <div style="flex: 1; padding: 10px; display: flex; flex-direction: column; height: 100%; position: relative; z-index: 10; justify-content: space-between; box-sizing: border-box;">
          <div style="display: flex; gap: 10px; flex: 1; align-items: center;">
            <!-- Left: Photo Frame -->
            <div style="border-radius: 8px; overflow: hidden; border: 2px solid ${themeColor}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; background: rgba(255, 255, 255, 0.8); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); width: ${photoFrameSize}px; height: ${photoFrameSize * 1.15}px; box-sizing: border-box;">
              ${renderPhotoHtml()}
            </div>

            <!-- Right: Details -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 0;">
              <!-- 1. Name -->
              <div style="position: relative; padding-bottom: 2px; border-bottom: 1px solid rgba(203, 213, 225, 0.8);">
                <p style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; margin: 0 0 2px 0; color: ${themeColor};">Name</p>
                <p style="font-weight: 900; font-size: 11px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; color: ${typingDetailsColor};">${studentName}</p>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 4px;">
                <!-- 2. Subject -->
                <div style="grid-column: span 2 / span 2; position: relative; padding-bottom: 2px; border-bottom: 1px solid rgba(203, 213, 225, 0.8);">
                  <p style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; margin: 0 0 2px 0; color: ${themeColor};">Subject</p>
                  <p style="font-weight: 900; font-size: 9.5px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; color: ${typingDetailsColor};">${slipSubject}</p>
                </div>
                <!-- 3. Class/Div -->
                <div style="position: relative; padding-bottom: 2px; border-bottom: 1px solid rgba(203, 213, 225, 0.8);">
                  <p style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; margin: 0 0 2px 0; color: ${themeColor};">Class / Div</p>
                  <p style="font-weight: 900; font-size: 9px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; color: ${typingDetailsColor};">${grade}${section ? ` - ${section}` : ""}</p>
                </div>
                <!-- 4. Roll No -->
                <div style="position: relative; padding-bottom: 2px; border-bottom: 1px solid rgba(203, 213, 225, 0.8);">
                  <p style="font-size: 6.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; margin: 0 0 2px 0; color: ${themeColor};">Roll No</p>
                  <p style="font-weight: 900; font-size: 9px; line-height: 1; margin: 0; color: ${typingDetailsColor};">${rollNo}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- School Footer -->
          <div style="margin-top: 4px; border-top: 1px solid rgba(203, 213, 225, 0.8); padding-top: 4px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; min-height: 16px;">
            <h4 style="font-weight: 800; font-size: 10px; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; letter-spacing: 0.025em; margin: 0; color: ${themeColor};">
              ${schoolName}
            </h4>
          </div>
        </div>
      </div>
    `;
  };

  const paddingTopBottom = is8Slips ? "10mm" : "7.5mm";
  const paddingLeftRight = "7.5mm";
  const gap = is8Slips ? "5mm" : "3.5mm";
  const gridRows = is8Slips ? "repeat(4, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))";

  const slipCellsHtml = slips.map((idx) => `<div style="width: 100%; height: 100%; box-sizing: border-box; min-width: 0; min-height: 0;">${renderSlipCell(idx)}</div>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Name Slips A4 Sheet</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
    }
    #print-sheet {
      width: 210mm;
      height: 297mm;
      padding-top: ${paddingTopBottom};
      padding-bottom: ${paddingTopBottom};
      padding-left: ${paddingLeftRight};
      padding-right: ${paddingLeftRight};
      gap: ${gap};
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: ${gridRows};
      box-sizing: border-box;
      overflow: hidden;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div id="print-sheet">
    ${slipCellsHtml}
  </div>
</body>
</html>`;
}
