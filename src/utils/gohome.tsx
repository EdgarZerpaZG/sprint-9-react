import { useNavigate } from "react-router-dom";

export function GoHome(path: string): () => void {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate(path);
    };

    return goToHome;
}