import streamlit as st
from pathlib import Path

from graph import agent
from states import Plan, TaskPlan, CoderState
from tools import (
    init_project_root,
    list_files_in_project,
    read_file_in_project,
)

PROJECT_ROOT = Path(init_project_root())


def to_dict(maybe_model):
    if maybe_model is None:
        return {}
    if isinstance(maybe_model, dict):
        return maybe_model
    if hasattr(maybe_model, "model_dump"):
        return maybe_model.model_dump()
    if hasattr(maybe_model, "dict"):
        # older Pydantic versions
        return maybe_model.dict()
    return {"value": str(maybe_model)}


def main():
    st.set_page_config(page_title="Dev Agent UI", layout="wide")
    st.title("Multi-Agent App Builder")

    st.write(
        "Describe the app you want to build and the agents will generate "
        "a project inside the `generated_project/` folder."
    )

    default_prompt = "Build a colourful modern todo app in HTML, CSS and JS"

    user_prompt = st.text_area(
        "User prompt",
        value=default_prompt,
        height=180,
        placeholder="Describe the app, features, tech stack, etc…",
    )

    col1, col2 = st.columns(2)
    with col1:
        recursion_limit = st.number_input(
            "Recursion limit",
            min_value=10,
            max_value=500,
            value=100,
            step=10,
            help="Passed to agent.invoke(..., {'recursion_limit': ...})",
        )

    run_clicked = st.button("🚀 Run agents")

    if run_clicked:
        if not user_prompt.strip():
            st.error("Please enter a prompt before running.")
            return

        with st.spinner("Running planner → architect → coder…"):
            result = agent.invoke(
                {"user_prompt": user_prompt.strip()},
                {"recursion_limit": int(recursion_limit)},
            )

        st.success("Done! Project generated/updated.")

        plan = result.get("plan")
        if plan is not None:
            plan_dict = to_dict(plan)
            with st.expander("📋 Plan (PLANNER output)", expanded=True):
                st.write(f"**Name:** {plan_dict.get('name')}")
                st.write(f"**Description:** {plan_dict.get('description')}")
                st.write(f"**Tech stack:** {plan_dict.get('techstack')}")

                features = plan_dict.get("features") or []
                if features:
                    st.write("**Features:**")
                    st.markdown("- " + "\n- ".join(features))

                files = plan_dict.get("files") or []
                if files:
                    st.write("**Planned files:**")
                    for f in files:
                        path = f.get("path")
                        purpose = f.get("purpose")
                        st.markdown(f"- `{path}` — {purpose}")

        task_plan = result.get("task_plan")
        if task_plan is not None:
            task_plan_dict = to_dict(task_plan)
            steps = task_plan_dict.get("implementation_steps", [])
            with st.expander("🧱 Task Plan (ARCHITECT output)", expanded=False):
                if not steps:
                    st.info("No implementation steps found.")
                else:
                    for i, step in enumerate(steps):
                        filepath = step.get("filepath")
                        desc = step.get("task_description")
                        st.markdown(
                            f"**Step {i+1}:** `{filepath}`\n\n"
                            f"{desc}"
                        )
                        st.markdown("---")

        coder_state = result.get("coder_state")
        if coder_state is not None:
            coder_state_dict = to_dict(coder_state)
            with st.expander("🧩 Coder State (debug)", expanded=False):
                st.json(coder_state_dict)

    st.subheader("📂 Files in `generated_project/`")

    files_str = list_files_in_project(".")
    if files_str.startswith("ERROR"):
        st.warning(files_str)
        return

    file_list = [f for f in files_str.splitlines() if f.strip()]
    if not file_list:
        st.info("No files found yet. Run the agents to generate a project.")
        return

    col_files, col_view = st.columns([1, 2])

    with col_files:
        selected_file = st.selectbox(
            "Select a file to view",
            options=file_list,
        )

    with col_view:
        if selected_file:
            content = read_file_in_project(selected_file)
            if content.startswith("ERROR"):
                st.error(content)
            else:
                ext = selected_file.split(".")[-1].lower() if "." in selected_file else ""
                lang_map = {
                    "py": "python",
                    "js": "javascript",
                    "ts": "typescript",
                    "tsx": "tsx",
                    "html": "html",
                    "css": "css",
                    "json": "json",
                    "md": "markdown",
                    "txt": "text",
                }
                language = lang_map.get(ext, "text")
                st.code(content, language=language)


if __name__ == "__main__":
    main()
