import { useState } from "react";
import "./App.scss";

import JsonGrid from "./resources/grid-bcc-2024-1.json";

interface Grid {}

interface DataDisciplina {
  codigo: string;
  nome: string;
  creditos: number;
  creditos_assincronos: any;
  turmas: Array<DataTurma>;
}
interface DataHorario {
  horario: string;
  sala: string;
}

interface DataTurma {
  codigo: string;
  enquadramento: string;
  vagas_total: number;
  vagas_calouros: number;
  reserva: string;
  prioridade_cursos: Array<string[]>;
  horarios: Array<DataHorario>;
  professores: Array<string>;
  optativa_matrizes: Array<string>;
}

function ElementCardDisciplina(
  data: {
    disciplinaInformations: DataDisciplina;
    onAdd?: () => void;
    onDelete?: () => void;
  },
  props: { onclick: () => void }
) {
  const { disciplinaInformations, onAdd, onDelete } = data;

  const { codigo, nome, turmas } = disciplinaInformations;

  return (
    <div className="disciplina">
      <h2>
        {codigo}
        <br />
        {nome}
      </h2>
      <div className="containerTurmas">
        {turmas.map((turma, index) => (
          <button className="turma" key={index} onClick={onAdd}>
            <h3 className="title">{`${turma.codigo} - ${turma.professores} / ${turma.prioridade_cursos}`}</h3>
            <span>
              <strong>Veteranos</strong>:{" "}
              {turma.vagas_total - turma.vagas_calouros}{" "}
              <strong>Calouros</strong>: {turma.vagas_calouros}{" "}
            </span>
          </button>
        ))}
      </div>
      {onDelete && <button onClick={onDelete}>Delete</button>}
      {onAdd && <button onClick={onAdd}>Add</button>}
    </div>
  );
}

function App() {
  const { curso, disciplinas, ultima_atualizacao } = JsonGrid;

  const [turmasSelecionadas, setTurmasSelecionadas] = useState<
    DataDisciplina[]
  >([]);

  const [hideSelectedDisciplines, setHideSelectedDisciplines] =
    useState<boolean>(false);

  const [hideConflictedClass, setHideConflictedClass] =
    useState<boolean>(false);

  return (
    <>
      <section id="Presentation">
        <h1>{`${curso} (${ultima_atualizacao})`}</h1>
      </section>
      <hr />
      <section id={"GridAssembler"}>
        <h1>Montador de grade</h1>
        <div className="row">
          <div className="col">
            <h2 className="title">Lista de todas as materias</h2>
            <div>
              <input
                type="checkbox"
                checked={hideSelectedDisciplines}
                onChange={() =>
                  setHideSelectedDisciplines(!hideSelectedDisciplines)
                }
              />
              Ocultar disciplinas selecionadas
              <input
                type="checkbox"
                checked={hideConflictedClass}
                onChange={() => setHideConflictedClass(!hideConflictedClass)}
              />
              Ocultar turmas com conflito
            </div>
            {disciplinas.map((disciplina, index) => {
              const [selectedDiscipline] = turmasSelecionadas.filter(
                ({ codigo }) => codigo === disciplina.codigo
              );

              if (hideSelectedDisciplines && selectedDiscipline !== undefined) {
                return null;
              }

              return (
                <div className="cardDisciplina" key={index}>
                  <h3>
                    {disciplina.nome} - {disciplina.codigo}
                  </h3>
                  <div className="containerClasses">
                    {disciplina.turmas.map((turma, index) => {
                      let selectedClass = undefined;

                      if (selectedDiscipline !== undefined) {
                        [selectedClass] = selectedDiscipline.turmas.filter(
                          ({ codigo }) => codigo === turma.codigo
                        );
                      }
                      const listOfConflit: DataDisciplina[] = [];

                      turmasSelecionadas.forEach(({ turmas, ...rest }) => {
                        const conflicts = turmas.filter(
                          ({ horarios, codigo }) => {
                            const conflict = horarios.filter(({ horario }) => {
                              for (const actualClassHorario of turma.horarios)
                                if (
                                  actualClassHorario.horario === horario &&
                                  turma.codigo !== codigo
                                )
                                  return true;
                            });
                            return conflict.length > 0;
                          }
                        );

                        if (conflicts.length > 0) {
                          listOfConflit.push({
                            ...rest,
                            turmas: conflicts,
                          });
                        }
                      });

                      if (hideConflictedClass && listOfConflit.length > 0)
                        return null;

                      return (
                        <button
                          key={index}
                          className={`class ${selectedClass && "selected"} ${
                            listOfConflit.length > 0 && "conflict"
                          }`}
                          disabled={
                            selectedDiscipline !== undefined ||
                            listOfConflit.length > 0
                          }
                          onClick={() => {
                            const { turmas, ...rest } = disciplina;

                            setTurmasSelecionadas([
                              ...turmasSelecionadas,
                              {
                                ...rest,
                                turmas: [turma],
                              },
                            ]);
                          }}
                        >
                          <span>{`${turma.codigo} - ${turma.professores}`}</span>
                          <span>
                            Vagas: {turma.vagas_total - turma.vagas_calouros},
                            Calouros {turma.vagas_calouros}
                          </span>
                          <span>{turma.prioridade_cursos}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="col">
            <h2 className="title">Turmas selecionadas</h2>
            {turmasSelecionadas.map((disciplina, index) => {
              return (
                <div className="cardDisciplina" key={index}>
                  <h3>
                    {disciplina.nome} - {disciplina.codigo}
                  </h3>
                  <div className="containerClasses">
                    {disciplina.turmas.map((turma, classIndex) => {
                      return (
                        <button
                          className="class"
                          key={classIndex}
                          onClick={() => {
                            turmasSelecionadas.splice(classIndex, 1);
                            setTurmasSelecionadas([...turmasSelecionadas]);
                          }}
                        >
                          <span>{`${turma.codigo} - ${turma.professores}`}</span>
                          <span>
                            Vagas: {turma.vagas_total - turma.vagas_calouros},
                            Calouros {turma.vagas_calouros}
                          </span>
                          <span>{turma.prioridade_cursos}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="col">
            <h2 className="title">Horario</h2>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
