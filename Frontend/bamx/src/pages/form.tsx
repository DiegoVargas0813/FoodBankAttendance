import BeneficiaryForm from "../components/beneficiaryForm/beneficiaryForm";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebard";

const FormPage = () => (
  <div>
    <div className="flex min-h-screen">   
            <Sidebar/>
            <div className="flex-1 flex flex-col">
                <Header/>
            <h1 className="text-2xl font-bold mb-4">Formulario de Beneficiario</h1>
                <BeneficiaryForm/>
            </div>
        </div>
    </div>
);

export default FormPage;