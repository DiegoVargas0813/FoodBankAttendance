import BeneficiaryForm from "../components/beneficiaryForm/beneficiaryForm";
import Layout from "../components/layout/layout";

const FormPage = () => (
  <div>
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Formulario de Beneficiario</h1>
      <BeneficiaryForm />
    </Layout>
</div>
);

export default FormPage;