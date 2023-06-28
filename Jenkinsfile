pipeline {
    agent any
    
    stages {
        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Retrieve ECR authentication token
                    def ecrAuth = sh(
                        returnStdout: true,
                        script: 'aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 040699290715.dkr.ecr.ap-south-1.amazonaws.com'
                    )
                    
                    // Build and push the Docker image
                    sh "ls"
                    sh "docker build -t 040699290715.dkr.ecr.ap-south-1.amazonaws.com/smart-staff-backend:${env.BUILD_NUMBER} ."
                    sh "docker push  040699290715.dkr.ecr.ap-south-1.amazonaws.com/smart-staff-backend:${env.BUILD_NUMBER}"
                }
            }
        }
        stage('Clean Workspace') {
            steps {
                // Clean the workspace
                deleteDir()
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {

                    withCredentials([
                        string(credentialsId: 'relambda_git_token', variable: 'ACCESS_TOKEN')
                    ]) {
                       // Clone the helm-deployment repository
                        sh "git clone https://${ACCESS_TOKEN}@github.com/ReLambda/sss-infra-prod"
                        sh "ls"
                        sh "pwd"
                        dir('sss-infra-prod') {
                            dir('k8s/release/prod/app/smart-staff-backend') {
                                sh "ls"
                                sh "pwd"
                                sh "yq eval -i '.image.tag = ${env.BUILD_NUMBER}' values.yaml"
                                sh "git config user.name 'rl-abdullah'"
                                sh "git config user.email 'abdullah@relambda.com'"
                                sh "git config --global push.default current"
                                sh "git add values.yaml"
                                sh "git commit -m 'Update values.yaml with image tag using build number ${env.BUILD_NUMBER}'"
                                sh "git push https://${ACCESS_TOKEN}@github.com/ReLambda/sss-infra-prod"
                     
                            }
                        }    
                    }

                    // Apply the updated  using helm
                    withEnv(["KUBECONFIG=$HOME/.kube/sss-prod-eks-2LgdDngQ"]) {
                        dir('sss-infra-prod/k8s/') {
                            sh "pwd"
                            sh "ls"
                            sh "helm upgrade --install smart-staff-backend charts/webapp/ -f release/prod/app/smart-staff-backend/values.yaml -n prod"
                            dir('release/prod/app/smart-staff-backend') {
                                sh "ls"
                                sh "cat values.yaml"
                            }
                        }
                    }
                   
                }
            }
        
        }

    }
}


