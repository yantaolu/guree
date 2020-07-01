import React, {
  FormEventHandler,
  ReactElement,
} from "react";
import "./Form.scss";
import { scopedClass } from "@utils/index";
import FormContext from "./context";
import { verify } from "./validator";
import { useFormFields, FormState, SetErrorsMsgs } from "./fields";

interface Props {
  children: ReactElement;
  onFinish: (formValues: FormState) => {};
}

const Form: React.FunctionComponent<Props> = ({
  children,
  onFinish,
}: Props) => {
  const fields = useFormFields();

  fields.init(children);
  const { getForm, getAllForm, setErrorsMsgs, getChildrenProps } = fields;
  const formValues = getAllForm();

  const totalValidate = (setErrorsMsgs: SetErrorsMsgs) => {
    return Promise.all(
      getChildrenProps().map(async (item) => {
        const { name, rules } = item;
        const res = await verify(rules, getForm(name));
        const { status, errorMsgs } = res;
        setErrorsMsgs((preErrorMsgs) => {
          return Object.assign({}, preErrorMsgs, {
            [name]: errorMsgs,
          });
        });
        return status;
      })
    );
  };

  const submitHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await totalValidate(setErrorsMsgs);
    const validateResult = res.reduce((total, cur) => total && cur, true);
    validateResult && onFinish(formValues);
  };
  return (
    <FormContext.Provider
      value={{
        formContext: { fields: fields },
      }}
    >
      <form onSubmit={submitHandler} className={scopedClass("form")}>{children}</form>
    </FormContext.Provider>
  );
};

export default Form;
