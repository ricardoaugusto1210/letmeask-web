import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'

import logoImg from '../assets/images/logo.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import deleteImg from '../assets/images/delete.svg'


import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
// import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';

import { database } from '../services/firebase';
import { CgTrashEmpty } from 'react-icons/cg';

import '../styles/room.scss'
import '../styles/modal.scss'

import Modal from 'react-modal'


type RoomParams = {
  id: string;
}

export function AdminRoom() {
  // const { user } = useAuth();

  const history = useHistory()
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const [modalIsOpen, setIsOpen] = useState(false);

  const { title, questions } = useRoom(roomId);

  async function handleEndRoom() {
    if (window.confirm('Tem certeza que você deseja excluir esta sala?')) {
      await database.ref(`rooms/${roomId}`).update({
        endedAt: new Date(),
      })

      history.push('/')
    }
  }

  // Modal 

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false)
  }

  async function handleDeleteQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    closeModal();
  }

  // async function handleDeleteQuestion(questionId: string) {
  //   if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
  //     await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
  //   }
  // }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    })
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button
              isOutlined
              onClick={handleEndRoom}
            >
              Encerrar sala
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>
        <div className="question-list">
          {questions.map(question => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar pergunta como respondida" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque à pergunta" />
                    </button>

                    <div>
                      <button onClick={openModal}>
                        <img src={deleteImg} alt="Delete a pergunta" />
                      </button>
                      <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        style={{
                          overlay: {
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                          },
                          content: {
                            height: '330px',
                            width: '490px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: '180px',
                            left: '425px',
                            right: 'auto',
                            bottom: 'auto',
                            backgroundColor: '#F8F8F8',
                          }
                        }}
                      >
                        <div className="modalWrapper">
                          <CgTrashEmpty size={24} />
                          <div className="modalTitle">
                            <h2>Excluir pergunta</h2>
                            <span>Tem certeza que você deseja excluir esta pergunta?</span>
                          </div>
                          <div className="footer">
                            <button className="buttons" onClick={closeModal}>Cancelar</button>
                            <Button onClick={() => handleDeleteQuestion(question.id)}>Sim, excluir</Button>
                          </div>
                        </div>
                      </Modal>
                    </div>
                  </>
                )}
              </Question>
            )
          })}
        </div>
      </main>
    </div>
  )
}