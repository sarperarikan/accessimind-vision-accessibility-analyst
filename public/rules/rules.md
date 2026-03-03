# General Accessibility Constitution (WCAG 2.2 AA)

This document establishes the non-negotiable accessibility standards applicable to ALL platforms (Web, Mobile, Desktop).

## 1. Perceivable
*Information and user interface components must be presentable to users in ways they can perceive.*

- **Text Alternatives (1.1)**: All non-text content (images, icons, graphs) must have a text alternative that serves the equivalent purpose.
- **Time-Based Media (1.2)**: Captions and transcripts are mandatory for all audio/video content.
- **Adaptable (1.3)**: Info and structure (headings, lists) must be programmatically determined. Content must not restrict view orientation (Portrait/Landscape).
- **Distinguishable (1.4)**:
    - **Color**: Color is never the *only* visual means of conveying information.
    - **Contrast**: Text < 18pt requires **4.5:1** contrast. Graphics/UI require **3:1**.
    - **Resize**: Text must resize up to **200%** without loss of content or functionality.

## 2. Operable
*User interface components and navigation must be operable.*

- **Keyboard Accessible (2.1)**: All functionality is available via keyboard interface without requiring specific timings for individual keystrokes. No keyboard traps.
- **Enough Time (2.2)**: Users can turn off, adjust, or extend time limits. Animation must be pausable.
- **Seizures (2.3)**: No content flashes more than 3 times per second.
- **Navigable (2.4)**:
    - **Focus Order**: Must be sequential and meaningful.
    - **Focus Visible**: Keyboard focus indicator must be clearly visible.
    - **Target Size**: Minimum **24x24 px** (WCAG 2.2 new), ideal **44x44 px/pt** (Mobile).

## 3. Understandable
*Information and the operation of user interface must be understandable.*

- **Readable (3.1)**: Language of the page and parts of content must be programmatically determined.
- **Predictable (3.2)**: Components appear and operate in predictable ways. Changing setting (focus) does not automatically cause a change of context.
- **Input Assistance (3.3)**:
    - **Error Identification**: Errors are identified and described to the user in text.
    - **Labels**: Labels or instructions are provided when content requires user input.

## 4. Robust
*Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.*

- **Compatible (4.1)**:
    - **Parsing**: Start and end tags are complete, elements are nested according to specs, IDs are unique.
    - **Name, Role, Value**: For all UI components, the name and role can be programmatically determined; states, properties, and values can be set by user agents.
