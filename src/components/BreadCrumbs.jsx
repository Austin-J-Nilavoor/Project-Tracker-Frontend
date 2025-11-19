import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from 'lucide-react';
import projectService from '../services/projectServices';
import milestoneService from '../services/milestoneServices';
import '../styles/Breadcrumbs.css';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(x => x);

    const [displayNames, setDisplayNames] = useState({});

    useEffect(() => {
        const resolveNames = async () => {
            const newNames = { ...displayNames };
            let hasChanges = false;

            for (let i = 0; i < pathnames.length; i++) {
                const segment = pathnames[i];
                const prevSegment = pathnames[i - 1];

                if (segment === 'new') continue;

                const isProjectRoute = prevSegment === 'projects';
                const isMilestoneRoute = prevSegment === 'milestones';

                if ((isProjectRoute || isMilestoneRoute) && !newNames[segment]) {
                    try {
                        if (isProjectRoute) {
                            const project = await projectService.getProjectById(segment);
                            if (project?.name) {
                                newNames[segment] = project.name;
                                hasChanges = true;
                            }
                        } else if (isMilestoneRoute) {
                            const milestone = await milestoneService.getMilestoneById(segment);
                            if (milestone?.name) {
                                newNames[segment] = milestone.name;
                                hasChanges = true;
                            }
                        }
                    } catch (error) {
                        console.warn(`Failed to resolve name for ID: ${segment}`, error);
                    }
                }
            }

            if (hasChanges) setDisplayNames(newNames);
        };

        resolveNames();
    }, [location.pathname]);

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link to="/" className="breadcrumb-link home-icon">
                        <Home size={16} />
                    </Link>
                </li>

                {pathnames.map((value, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathnames.length - 1;

                    let displayName = displayNames[value] ||
                        decodeURIComponent(value)
                            .replace(/-/g, ' ')
                            .replace(/^\w/, c => c.toUpperCase());

                    // ---------- NEW REDIRECTION LOGIC ----------
                    let finalRoute = routeTo;

                    // If "milestones" itself is clicked → redirect to project page
                    if (value === "milestones") {
                        const projectId = pathnames[pathnames.indexOf("projects") + 1];
                        if (projectId) finalRoute = `/projects/${projectId}`;
                    }

                    // If milestone ID is clicked → redirect to project page
                    const milestoneIndex = pathnames.indexOf("milestones");
                    if (milestoneIndex !== -1 && index === milestoneIndex + 1) {
                        const projectId = pathnames[milestoneIndex - 1];
                        if (projectId) finalRoute = `/projects/${projectId}`;
                    }
                    // ------------------------------------------------

                    return (
                        <li key={routeTo} className="breadcrumb-item-wrapper">
                            <ChevronRight size={14} className="breadcrumb-separator" />

                            {isLast ? (
                                <span className="breadcrumb-current" aria-current="page">
                                    {displayName}
                                </span>
                            ) : (
                                <Link to={finalRoute} className="breadcrumb-link">
                                    {displayName}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
