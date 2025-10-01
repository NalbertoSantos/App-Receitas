// 1️⃣ Importações principais do React e React Native
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,  // Para criar janelas modais
} from 'react-native';

// AsyncStorage para salvar dados localmente
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // 2️⃣ Estados do App
  const [view, setView] = useState('lista'); 
  // Controla qual tela será exibida: 'lista' ou 'formulario'

  const [recipes, setRecipes] = useState([]); 
  // Lista de receitas cadastradas

  const [title, setTitle] = useState(''); 
  // Campo título do formulário

  const [ingredients, setIngredients] = useState(''); 
  // Campo ingredientes do formulário

  const [preparation, setPreparation] = useState(''); 
  // Campo modo de preparo do formulário (desafio 1)

  const [editingId, setEditingId] = useState(null); 
  // Guarda o ID da receita que está sendo editada (desafio 2)

  const [modalVisible, setModalVisible] = useState(false); 
  // Controla se o Modal está visível

  const [recipeToDelete, setRecipeToDelete] = useState(null); 
  // Guarda a receita que será deletada

  // 3️⃣ useEffect para carregar receitas do AsyncStorage quando o app inicia
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const storedRecipes = await AsyncStorage.getItem('@recipes');
        if (storedRecipes !== null) {
          setRecipes(JSON.parse(storedRecipes)); 
        }
      } catch (e) {
        console.error('Falha ao carregar receitas.', e);
      }
    };
    loadRecipes();
  }, []); 

  // 4️⃣ useEffect para salvar receitas no AsyncStorage sempre que a lista mudar
  useEffect(() => {
    const saveRecipes = async () => {
      try {
        await AsyncStorage.setItem('@recipes', JSON.stringify(recipes));
      } catch (e) {
        console.error('Falha ao salvar receitas.', e);
      }
    };
    saveRecipes();
  }, [recipes]); 

  // 5️⃣ Função para adicionar ou editar receita
  const handleAddRecipe = () => {
    if (!title) return; // Não permite salvar se título estiver vazio

    if (editingId) {
      // Se estiver editando
      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === editingId
            ? { ...recipe, title, ingredients, preparation }
            : recipe
        )
      );
      setEditingId(null); // Limpa o estado de edição
    } else {
      // Adicionando nova receita
      const newRecipe = {
        id: Date.now().toString(),
        title,
        ingredients,
        preparation,
      };
      setRecipes((current) => [...current, newRecipe]);
    }

    // Limpa campos e volta para lista
    setTitle('');
    setIngredients('');
    setPreparation('');
    setView('lista');
  };

  // 6️⃣ Função para iniciar edição
  const handleEditRecipe = (recipe) => {
    setTitle(recipe.title);
    setIngredients(recipe.ingredients);
    setPreparation(recipe.preparation);
    setEditingId(recipe.id); 
    setView('formulario'); 
  };

  // 7️⃣ Função para abrir Modal ao tentar deletar
  const handleDeleteRecipe = (recipe) => {
    setRecipeToDelete(recipe);
    setModalVisible(true);
  };

  // 8️⃣ Confirma exclusão
  const confirmDelete = () => {
    setRecipes(current => current.filter(r => r.id !== recipeToDelete.id));
    setRecipeToDelete(null);
    setModalVisible(false);
  };

  // 9️⃣ Cancela exclusão
  const cancelDelete = () => {
    setRecipeToDelete(null);
    setModalVisible(false);
  };

  // 10️⃣ Interface visual
  return (
    <SafeAreaView style={styles.container}>
      {/* Modal de confirmação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelDelete} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Deseja deletar essa receita?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
              <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={cancelDelete}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={confirmDelete}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scroll principal */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>📖 Meu Livro de Receitas</Text>

        {view === 'lista' ? (
          <View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setView('formulario')}
            >
              <Text style={styles.buttonText}>Adicionar Nova Receita</Text>
            </TouchableOpacity>

            {recipes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma receita cadastrada.</Text>
            ) : (
              recipes.map((item) => (
                <View key={item.id} style={styles.recipeItem}>
                  <View style={styles.recipeTextContainer}>
                    <Text style={styles.recipeTitle}>{item.title}</Text>
                    <Text style={styles.recipeIngredients}>{item.ingredients}</Text>
                    <Text style={styles.recipeIngredients}>{item.preparation}</Text>
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    {/* Botão editar */}
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: '#f39c12' }]}
                      onPress={() => handleEditRecipe(item)}
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    {/* Botão excluir */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRecipe(item)}
                    >
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          // Tela do formulário
          <View style={styles.formContainer}>
            <Text style={styles.formHeader}>
              {editingId ? 'Editar Receita' : 'Adicionar Receita'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título da Receita"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingredientes"
              value={ingredients}
              onChangeText={setIngredients}
              multiline={true}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Modo de Preparo"
              value={preparation}
              onChangeText={setPreparation}
              multiline={true}
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => setView('lista')}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={handleAddRecipe}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 11️⃣ Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#e67e22' },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  formHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderColor: '#bdc3c7', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', justifyContent: 'space-around' },
  formButton: { flex: 1, padding: 12, borderRadius: 5, marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#95a5a6' },
  saveButton: { backgroundColor: '#27ae60' },
  addButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 20 },
  recipeItem: { backgroundColor: '#fff', padding: 20, marginVertical: 8, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeTextContainer: { flex: 1, marginRight: 15 },
  recipeTitle: { fontSize: 20, fontWeight: 'bold' },
  recipeIngredients: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  deleteButton: { backgroundColor: '#e74c3c', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, marginLeft: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 18, color: '#95a5a6' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 18, textAlign: 'center' },
});
