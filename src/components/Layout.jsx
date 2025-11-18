import { Link, useLocation } from "react-router-dom";
import '../components/breadcrumbs.css';

export default function Layout({ children }) {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(x => x);

    return (
        <div className="layout-container">

            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link to="/">Home</Link>

                {pathnames.map((name, index) => {
                    const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
                    const isLast = index === pathnames.length - 1;

                    return (
                        <span key={index}>
                            {" > "}
                            {isLast ? (
                                <span>{name}</span>
                            ) : (
                                <Link to={routeTo}>{name}</Link>
                            )}
                        </span>
                    );
                })}
            </nav>

            {/* Page Content */}
            <div className="content">{children}</div>
        </div>
    );
}
